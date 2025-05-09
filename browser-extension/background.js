// Guardian Shield Extension
// Background Service Worker

// API Endpoint - adjust to your server location
const API_URL = 'https://your-app-url.com/api';

// Configuration and settings
let extensionConfig = {
  enablePhishingDetection: true,
  enableDeepfakeDetection: true,
  enableVoiceDetection: true,
  alertLevel: 'medium', // 'low', 'medium', 'high'
  autoBlockThreats: true
};

// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  // Set default configuration
  chrome.storage.sync.set({ config: extensionConfig });
  console.log('Guardian Shield extension installed successfully');
});

// Listen for configuration changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.config) {
    extensionConfig = changes.config.newValue;
    console.log('Configuration updated:', extensionConfig);
  }
});

// URL phishing detector
chrome.webRequest.onBeforeRequest.addListener(
  async function(details) {
    // Skip if phishing detection is disabled
    if (!extensionConfig.enablePhishingDetection) {
      return { cancel: false };
    }

    // Only check main frame requests (actual navigation)
    if (details.type !== 'main_frame') {
      return { cancel: false };
    }
    
    const url = details.url;
    
    try {
      // Check URL against phishing API
      const response = await fetch(`${API_URL}/phishing-detection/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      const analysis = await response.json();
      
      // Determine if we should block based on alert level
      if (analysis.isPhishing) {
        if (extensionConfig.autoBlockThreats) {
          // Redirect to warning page
          return { 
            redirectUrl: chrome.runtime.getURL(
              `warning.html?url=${encodeURIComponent(url)}&threat=phishing&confidence=${analysis.confidence}`
            )
          };
        } else {
          // Send alert to content script instead of blocking
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, {
                action: 'showPhishingWarning',
                data: { url, analysis }
              });
            }
          });
        }
      }
      
      // Store this analysis in history
      storeAnalysisInHistory({
        type: 'url',
        content: url,
        result: analysis,
        timestamp: new Date().toISOString()
      });
      
      return { cancel: false };
    } catch (error) {
      console.error('Error analyzing URL:', error);
      return { cancel: false };
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'getConfig':
      sendResponse({ config: extensionConfig });
      break;
      
    case 'updateConfig':
      extensionConfig = { ...extensionConfig, ...message.data };
      chrome.storage.sync.set({ config: extensionConfig });
      sendResponse({ success: true, config: extensionConfig });
      break;
      
    case 'analyzeMedia':
      analyzeMedia(message.data)
        .then(result => sendResponse({ success: true, result }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Important for async response
      
    case 'getAnalysisHistory':
      chrome.storage.local.get('analysisHistory', (data) => {
        sendResponse({ history: data.analysisHistory || [] });
      });
      return true; // Important for async response
  }
});

// Store analysis in history
function storeAnalysisInHistory(analysisItem) {
  chrome.storage.local.get('analysisHistory', (data) => {
    const history = data.analysisHistory || [];
    
    // Add new item at the beginning
    history.unshift(analysisItem);
    
    // Limit history to 100 entries
    if (history.length > 100) {
      history.pop();
    }
    
    chrome.storage.local.set({ analysisHistory: history });
  });
}

// Media analysis function
async function analyzeMedia(data) {
  const { type, mediaBlob, mediaUrl } = data;
  
  if (!extensionConfig.enableDeepfakeDetection && type === 'video') {
    throw new Error('Deepfake detection is disabled');
  }
  
  if (!extensionConfig.enableVoiceDetection && type === 'audio') {
    throw new Error('Voice detection is disabled');
  }
  
  // Create form data
  const formData = new FormData();
  
  if (mediaBlob) {
    // If we have blob data from content script
    formData.append('file', mediaBlob, `analysis.${type === 'video' ? 'mp4' : 'mp3'}`);
  } else if (mediaUrl) {
    // If we just have a URL
    formData.append('url', mediaUrl);
  } else {
    throw new Error('No media provided for analysis');
  }
  
  // Send to appropriate API endpoint
  const endpoint = type === 'video' ? 'deepfake-detection' : 'voice-detection';
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error(`Analysis failed with status: ${response.status}`);
  }
  
  const result = await response.json();
  
  // Store this analysis in history
  storeAnalysisInHistory({
    type: type === 'video' ? 'video' : 'audio',
    content: mediaUrl || 'Blob data',
    result,
    timestamp: new Date().toISOString()
  });
  
  return result;
}