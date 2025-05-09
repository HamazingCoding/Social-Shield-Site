// Guardian Shield Extension
// Content Script

// Extension configuration - will be updated from background script
let extensionConfig = {
  enablePhishingDetection: true,
  enableDeepfakeDetection: true,
  enableVoiceDetection: true,
  alertLevel: 'medium', // 'low', 'medium', 'high'
  autoBlockThreats: true
};

// Request current configuration on load
chrome.runtime.sendMessage({ action: 'getConfig' }, (response) => {
  if (response && response.config) {
    extensionConfig = response.config;
    initializeContentScanner();
  }
});

// Initialize scanning of page content
function initializeContentScanner() {
  // Listen for DOM mutations to detect dynamically added content
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        scanNewNodes(mutation.addedNodes);
      }
    }
  });
  
  // Start observing document for changes
  observer.observe(document.body, {
    childList: true, 
    subtree: true
  });
  
  // Initial scan of page
  scanPage();
  
  // Set up listeners for user interactions
  setupInteractionListeners();
}

// Scan the entire page
function scanPage() {
  // Process audio elements
  if (extensionConfig.enableVoiceDetection) {
    scanAudioElements();
  }
  
  // Process video elements
  if (extensionConfig.enableDeepfakeDetection) {
    scanVideoElements();
  }
  
  // Process links for phishing
  if (extensionConfig.enablePhishingDetection) {
    scanLinks();
  }
}

// Scan newly added DOM nodes
function scanNewNodes(nodes) {
  nodes.forEach(node => {
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    
    // Check if this node is a media element or contains media elements
    if (extensionConfig.enableVoiceDetection) {
      const audioElements = node.tagName === 'AUDIO' ? [node] : node.querySelectorAll('audio');
      audioElements.forEach(audio => processAudioElement(audio));
    }
    
    if (extensionConfig.enableDeepfakeDetection) {
      const videoElements = node.tagName === 'VIDEO' ? [node] : node.querySelectorAll('video');
      videoElements.forEach(video => processVideoElement(video));
    }
    
    if (extensionConfig.enablePhishingDetection) {
      const links = node.tagName === 'A' ? [node] : node.querySelectorAll('a');
      links.forEach(link => processLink(link));
    }
  });
}

// Process all audio elements on the page
function scanAudioElements() {
  const audioElements = document.querySelectorAll('audio');
  audioElements.forEach(audio => processAudioElement(audio));
}

// Process an individual audio element
function processAudioElement(audio) {
  // Check if we've already processed this element
  if (audio.dataset.guardianShieldProcessed) return;
  
  // Mark as processed
  audio.dataset.guardianShieldProcessed = 'true';
  
  // Add warning overlay
  addMediaWarningOverlay(audio, 'audio');
  
  // Add event listener to check when audio starts playing
  audio.addEventListener('play', () => {
    // If auto-block is on, pause until analysis is complete
    if (extensionConfig.autoBlockThreats) {
      audio.pause();
      
      // Show analyzing indicator
      showAnalyzingIndicator(audio);
      
      // Get audio data for analysis
      getMediaBlob(audio.src)
        .then(blob => {
          // Send to background script for analysis
          chrome.runtime.sendMessage({
            action: 'analyzeMedia',
            data: {
              type: 'audio',
              mediaBlob: blob
            }
          }, (response) => {
            if (response && response.success) {
              const result = response.result;
              
              // Handle detection result
              if (result.isAI && shouldBlockContent(result.confidence)) {
                // Keep blocked with warning
                showAIWarning(audio, result);
              } else {
                // Allow playback
                hideAnalyzingIndicator(audio);
                audio.play();
              }
            } else {
              // Error occurred, allow playback but show warning
              console.error('Analysis failed:', response ? response.error : 'Unknown error');
              hideAnalyzingIndicator(audio);
              audio.play();
            }
          });
        })
        .catch(error => {
          console.error('Error getting audio blob:', error);
          hideAnalyzingIndicator(audio);
          audio.play();
        });
    }
  });
}

// Process all video elements on the page
function scanVideoElements() {
  const videoElements = document.querySelectorAll('video');
  videoElements.forEach(video => processVideoElement(video));
}

// Process an individual video element
function processVideoElement(video) {
  // Check if we've already processed this element
  if (video.dataset.guardianShieldProcessed) return;
  
  // Mark as processed
  video.dataset.guardianShieldProcessed = 'true';
  
  // Add warning overlay
  addMediaWarningOverlay(video, 'video');
  
  // Add event listener to check when video starts playing
  video.addEventListener('play', () => {
    // If auto-block is on, pause until analysis is complete
    if (extensionConfig.autoBlockThreats) {
      video.pause();
      
      // Show analyzing indicator
      showAnalyzingIndicator(video);
      
      // Get video data for analysis
      getMediaBlob(video.src)
        .then(blob => {
          // Send to background script for analysis
          chrome.runtime.sendMessage({
            action: 'analyzeMedia',
            data: {
              type: 'video',
              mediaBlob: blob
            }
          }, (response) => {
            if (response && response.success) {
              const result = response.result;
              
              // Handle detection result
              if (!result.isAuthentic && shouldBlockContent(result.confidenceScore)) {
                // Keep blocked with warning
                showDeepfakeWarning(video, result);
              } else {
                // Allow playback
                hideAnalyzingIndicator(video);
                video.play();
              }
            } else {
              // Error occurred, allow playback but show warning
              console.error('Analysis failed:', response ? response.error : 'Unknown error');
              hideAnalyzingIndicator(video);
              video.play();
            }
          });
        })
        .catch(error => {
          console.error('Error getting video blob:', error);
          hideAnalyzingIndicator(video);
          video.play();
        });
    }
  });
}

// Scan all links on the page
function scanLinks() {
  const links = document.querySelectorAll('a');
  links.forEach(link => processLink(link));
}

// Process an individual link
function processLink(link) {
  // Check if we've already processed this element
  if (link.dataset.guardianShieldProcessed) return;
  
  // Mark as processed
  link.dataset.guardianShieldProcessed = 'true';
  
  // Add event listener for hover to provide early warning
  link.addEventListener('mouseenter', () => {
    const url = link.href;
    
    // Don't analyze empty or javascript links
    if (!url || url.startsWith('javascript:') || url.startsWith('#')) return;
    
    // Quick client-side check for suspicious features
    const suspiciousFeatures = quickCheckUrl(url);
    
    if (suspiciousFeatures.length > 0) {
      // Show warning tooltip on hover
      showLinkWarningTooltip(link, suspiciousFeatures);
    }
  });
  
  // Add event listener for click to perform deeper analysis
  link.addEventListener('click', (event) => {
    const url = link.href;
    
    // Don't analyze empty or javascript links
    if (!url || url.startsWith('javascript:') || url.startsWith('#')) return;
    
    // If it's an external link, potentially dangerous
    if (isExternalLink(url)) {
      // If auto-block is enabled, prevent default navigation until analysis completes
      if (extensionConfig.autoBlockThreats) {
        event.preventDefault();
        event.stopPropagation();
        
        // Show analyzing indicator
        showLinkAnalyzingIndicator(link);
        
        // Send to background script for analysis
        chrome.runtime.sendMessage({
          action: 'analyzeLink',
          data: {
            url
          }
        }, (response) => {
          if (response && response.success) {
            const result = response.result;
            
            // Handle detection result
            if (result.isPhishing && shouldBlockContent(result.confidence)) {
              // Show phishing warning
              showPhishingWarning(link, url, result);
            } else {
              // Allow navigation
              hideLinkAnalyzingIndicator(link);
              window.location.href = url;
            }
          } else {
            // Error occurred, allow navigation but show warning
            console.error('Analysis failed:', response ? response.error : 'Unknown error');
            hideLinkAnalyzingIndicator(link);
            window.location.href = url;
          }
        });
      }
    }
  });
}

// Set up listeners for user interactions that might need monitoring
function setupInteractionListeners() {
  // Monitor clipboard paste events for potential phishing content
  document.addEventListener('paste', (event) => {
    if (!extensionConfig.enablePhishingDetection) return;
    
    // Check if paste happened in an input field
    const target = event.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      const clipboardData = event.clipboardData || window.clipboardData;
      const pastedText = clipboardData.getData('text');
      
      // Look for potential phishing content like URLs in the pasted text
      if (looksLikeUrl(pastedText)) {
        const suspiciousFeatures = quickCheckUrl(pastedText);
        
        if (suspiciousFeatures.length > 0) {
          showPasteWarning(target, pastedText, suspiciousFeatures);
        }
      }
    }
  });
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'showPhishingWarning') {
    showFullPagePhishingWarning(message.data.url, message.data.analysis);
    sendResponse({ success: true });
  }
});

// Utility functions

// Get blob data from a media URL
async function getMediaBlob(url) {
  const response = await fetch(url);
  return await response.blob();
}

// Determine if a URL is external to the current site
function isExternalLink(url) {
  try {
    const currentHost = window.location.hostname;
    const urlHost = new URL(url).hostname;
    return currentHost !== urlHost;
  } catch (e) {
    return false;
  }
}

// Quick client-side check for suspicious URL features
function quickCheckUrl(url) {
  const suspiciousFeatures = [];
  
  try {
    const urlObj = new URL(url);
    
    // Check for HTTP instead of HTTPS
    if (urlObj.protocol === 'http:') {
      suspiciousFeatures.push('Insecure connection (HTTP)');
    }
    
    // Check for IP address instead of domain name
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(urlObj.hostname)) {
      suspiciousFeatures.push('IP address used instead of domain name');
    }
    
    // Check for suspicious subdomains
    if (urlObj.hostname.includes('secure-') || 
        urlObj.hostname.includes('login-') || 
        urlObj.hostname.includes('account-')) {
      suspiciousFeatures.push('Suspicious subdomain pattern');
    }
    
    // Check for URL shorteners
    const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl'];
    if (shorteners.some(s => urlObj.hostname.includes(s))) {
      suspiciousFeatures.push('URL shortener detected');
    }
    
    // Check for suspicious path components
    const suspiciousPaths = ['login', 'signin', 'account', 'password', 'secure', 'update'];
    for (const path of suspiciousPaths) {
      if (urlObj.pathname.includes(path)) {
        suspiciousFeatures.push('Suspicious path component');
        break;
      }
    }
    
  } catch (e) {
    // Not a valid URL
    return [];
  }
  
  return suspiciousFeatures;
}

// Check if text looks like a URL
function looksLikeUrl(text) {
  return /^(https?:\/\/|www\.)/i.test(text.trim());
}

// Determine if content should be blocked based on confidence score and alert level
function shouldBlockContent(confidenceScore) {
  switch (extensionConfig.alertLevel) {
    case 'low':
      return confidenceScore > 90;
    case 'medium':
      return confidenceScore > 75;
    case 'high':
      return confidenceScore > 60;
    default:
      return confidenceScore > 75;
  }
}

// UI Notification Functions

// Add warning overlay to media elements
function addMediaWarningOverlay(mediaElement, type) {
  const container = document.createElement('div');
  container.className = 'guardian-shield-media-container';
  container.style.position = 'relative';
  container.style.display = 'inline-block';
  
  // Wrap media element in container
  mediaElement.parentNode.insertBefore(container, mediaElement);
  container.appendChild(mediaElement);
  
  // Add icon overlay
  const overlay = document.createElement('div');
  overlay.className = 'guardian-shield-media-overlay';
  overlay.style.position = 'absolute';
  overlay.style.top = '5px';
  overlay.style.right = '5px';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.borderRadius = '50%';
  overlay.style.width = '24px';
  overlay.style.height = '24px';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.cursor = 'pointer';
  overlay.style.zIndex = '10000';
  overlay.innerHTML = `<img src="${chrome.runtime.getURL('icons/icon16.png')}" width="16" height="16" />`;
  
  // Add tooltip
  overlay.title = `Guardian Shield is monitoring this ${type} for AI-generated content`;
  
  // Add to container
  container.appendChild(overlay);
}

// Show analyzing indicator for media
function showAnalyzingIndicator(mediaElement) {
  const container = mediaElement.parentNode;
  
  const indicator = document.createElement('div');
  indicator.className = 'guardian-shield-analyzing';
  indicator.style.position = 'absolute';
  indicator.style.top = '0';
  indicator.style.left = '0';
  indicator.style.width = '100%';
  indicator.style.height = '100%';
  indicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  indicator.style.display = 'flex';
  indicator.style.flexDirection = 'column';
  indicator.style.alignItems = 'center';
  indicator.style.justifyContent = 'center';
  indicator.style.color = 'white';
  indicator.style.zIndex = '10001';
  indicator.innerHTML = `
    <div style="width: 40px; height: 40px; border: 3px solid #ffffff; border-radius: 50%; border-top-color: transparent; animation: guardian-shield-spin 1s linear infinite;"></div>
    <div style="margin-top: 10px; font-family: Arial, sans-serif; font-size: 14px;">Analyzing for AI content...</div>
  `;
  
  // Add spinner animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes guardian-shield-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  container.appendChild(indicator);
}

// Hide analyzing indicator
function hideAnalyzingIndicator(mediaElement) {
  const container = mediaElement.parentNode;
  const indicator = container.querySelector('.guardian-shield-analyzing');
  if (indicator) {
    indicator.remove();
  }
}

// Show AI warning for audio
function showAIWarning(audioElement, result) {
  const container = audioElement.parentNode;
  hideAnalyzingIndicator(audioElement);
  
  const warning = document.createElement('div');
  warning.className = 'guardian-shield-warning';
  warning.style.position = 'absolute';
  warning.style.top = '0';
  warning.style.left = '0';
  warning.style.width = '100%';
  warning.style.height = '100%';
  warning.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
  warning.style.display = 'flex';
  warning.style.flexDirection = 'column';
  warning.style.alignItems = 'center';
  warning.style.justifyContent = 'center';
  warning.style.color = 'white';
  warning.style.zIndex = '10001';
  warning.style.padding = '10px';
  warning.innerHTML = `
    <div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 10px;">⚠️ AI-Generated Voice Detected</div>
    <div style="font-family: Arial, sans-serif; font-size: 14px; text-align: center; margin-bottom: 15px;">
      This audio likely contains AI-generated voice content (${result.confidence}% confidence).
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="guardian-shield-play-anyway" style="padding: 5px 10px; background-color: transparent; border: 1px solid white; color: white; cursor: pointer;">
        Play Anyway
      </button>
      <button class="guardian-shield-view-details" style="padding: 5px 10px; background-color: white; border: none; color: #DC2626; cursor: pointer;">
        View Details
      </button>
    </div>
  `;
  
  container.appendChild(warning);
  
  // Add event listeners
  const playButton = warning.querySelector('.guardian-shield-play-anyway');
  playButton.addEventListener('click', () => {
    warning.remove();
    audioElement.play();
  });
  
  const detailsButton = warning.querySelector('.guardian-shield-view-details');
  detailsButton.addEventListener('click', () => {
    showDetailsModal('audio', result);
  });
}

// Show deepfake warning for video
function showDeepfakeWarning(videoElement, result) {
  const container = videoElement.parentNode;
  hideAnalyzingIndicator(videoElement);
  
  const warning = document.createElement('div');
  warning.className = 'guardian-shield-warning';
  warning.style.position = 'absolute';
  warning.style.top = '0';
  warning.style.left = '0';
  warning.style.width = '100%';
  warning.style.height = '100%';
  warning.style.backgroundColor = 'rgba(220, 38, 38, 0.9)';
  warning.style.display = 'flex';
  warning.style.flexDirection = 'column';
  warning.style.alignItems = 'center';
  warning.style.justifyContent = 'center';
  warning.style.color = 'white';
  warning.style.zIndex = '10001';
  warning.style.padding = '10px';
  warning.innerHTML = `
    <div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 10px;">⚠️ Potential Deepfake Detected</div>
    <div style="font-family: Arial, sans-serif; font-size: 14px; text-align: center; margin-bottom: 15px;">
      This video may contain manipulated content (${result.confidenceScore}% confidence).
    </div>
    <div style="display: flex; gap: 10px;">
      <button class="guardian-shield-play-anyway" style="padding: 5px 10px; background-color: transparent; border: 1px solid white; color: white; cursor: pointer;">
        Play Anyway
      </button>
      <button class="guardian-shield-view-details" style="padding: 5px 10px; background-color: white; border: none; color: #DC2626; cursor: pointer;">
        View Details
      </button>
    </div>
  `;
  
  container.appendChild(warning);
  
  // Add event listeners
  const playButton = warning.querySelector('.guardian-shield-play-anyway');
  playButton.addEventListener('click', () => {
    warning.remove();
    videoElement.play();
  });
  
  const detailsButton = warning.querySelector('.guardian-shield-view-details');
  detailsButton.addEventListener('click', () => {
    showDetailsModal('video', result);
  });
}

// Show warning tooltip for suspicious links
function showLinkWarningTooltip(linkElement, suspiciousFeatures) {
  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.className = 'guardian-shield-tooltip';
  tooltip.style.position = 'absolute';
  tooltip.style.backgroundColor = '#FEF2F2';
  tooltip.style.color = '#DC2626';
  tooltip.style.padding = '8px 12px';
  tooltip.style.borderRadius = '4px';
  tooltip.style.fontSize = '12px';
  tooltip.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  tooltip.style.zIndex = '10002';
  tooltip.style.maxWidth = '250px';
  tooltip.style.border = '1px solid #FCA5A5';
  
  // Add content
  tooltip.innerHTML = `
    <div style="font-weight: bold; margin-bottom: 5px;">⚠️ Warning: Suspicious Link</div>
    <ul style="margin: 0; padding-left: 15px;">
      ${suspiciousFeatures.map(feature => `<li>${feature}</li>`).join('')}
    </ul>
  `;
  
  // Position tooltip near the link
  document.body.appendChild(tooltip);
  const linkRect = linkElement.getBoundingClientRect();
  tooltip.style.left = `${linkRect.left + window.scrollX}px`;
  tooltip.style.top = `${linkRect.bottom + window.scrollY + 5}px`;
  
  // Add removal logic
  linkElement.addEventListener('mouseleave', () => {
    tooltip.remove();
  });
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (document.body.contains(tooltip)) {
      tooltip.remove();
    }
  }, 5000);
}

// Show analyzing indicator for links
function showLinkAnalyzingIndicator(linkElement) {
  // Create indicator overlay
  const overlay = document.createElement('div');
  overlay.className = 'guardian-shield-link-analyzing';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '10003';
  
  // Add content
  overlay.innerHTML = `
    <div style="background-color: white; padding: 20px; border-radius: 8px; text-align: center; max-width: 400px;">
      <div style="width: 40px; height: 40px; border: 3px solid #6366F1; border-radius: 50%; border-top-color: transparent; animation: guardian-shield-spin 1s linear infinite; margin: 0 auto 15px;"></div>
      <div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 10px;">Guardian Shield</div>
      <div style="font-family: Arial, sans-serif; font-size: 14px; margin-bottom: 5px;">Analyzing link for phishing threats...</div>
      <div style="font-family: Arial, sans-serif; font-size: 12px; color: #6B7280;">${linkElement.href}</div>
    </div>
  `;
  
  document.body.appendChild(overlay);
}

// Hide link analyzing indicator
function hideLinkAnalyzingIndicator() {
  const indicator = document.querySelector('.guardian-shield-link-analyzing');
  if (indicator) {
    indicator.remove();
  }
}

// Show phishing warning for links
function showPhishingWarning(linkElement, url, result) {
  hideLinkAnalyzingIndicator();
  
  // Create warning overlay
  const overlay = document.createElement('div');
  overlay.className = 'guardian-shield-phishing-warning';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(220, 38, 38, 0.95)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '10003';
  
  // Add content
  overlay.innerHTML = `
    <div style="background-color: white; padding: 20px; border-radius: 8px; text-align: center; max-width: 500px;">
      <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
      <div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin-bottom: 15px; color: #DC2626;">Phishing Threat Detected</div>
      <div style="font-family: Arial, sans-serif; font-size: 16px; margin-bottom: 20px;">
        Guardian Shield has detected that this link may be a phishing attempt.
      </div>
      <div style="font-family: Arial, sans-serif; font-size: 14px; padding: 10px; background-color: #FEF2F2; border: 1px solid #FCA5A5; border-radius: 4px; margin-bottom: 20px; word-break: break-all;">
        ${url}
      </div>
      <div style="margin-bottom: 20px; text-align: left;">
        <div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 10px;">Detected issues:</div>
        <ul style="font-family: Arial, sans-serif; font-size: 14px; padding-left: 20px;">
          ${result.details.map(detail => `<li style="margin-bottom: 5px;">${detail}</li>`).join('')}
        </ul>
      </div>
      <div style="display: flex; justify-content: space-between; gap: 10px;">
        <button class="guardian-shield-go-back" style="flex: 1; padding: 10px; background-color: #F3F4F6; border: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 14px; cursor: pointer;">
          Go Back (Safe)
        </button>
        <button class="guardian-shield-continue-anyway" style="flex: 1; padding: 10px; background-color: transparent; border: 1px solid #DC2626; color: #DC2626; border-radius: 4px; font-family: Arial, sans-serif; font-size: 14px; cursor: pointer;">
          Proceed Anyway (Risky)
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Add event listeners
  const backButton = overlay.querySelector('.guardian-shield-go-back');
  backButton.addEventListener('click', () => {
    overlay.remove();
  });
  
  const continueButton = overlay.querySelector('.guardian-shield-continue-anyway');
  continueButton.addEventListener('click', () => {
    overlay.remove();
    window.location.href = url;
  });
}

// Show full page phishing warning (called from background script)
function showFullPagePhishingWarning(url, analysis) {
  // Create warning overlay
  const overlay = document.createElement('div');
  overlay.className = 'guardian-shield-full-page-warning';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(220, 38, 38, 0.95)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '10003';
  
  // Add content
  overlay.innerHTML = `
    <div style="background-color: white; padding: 20px; border-radius: 8px; text-align: center; max-width: 500px;">
      <div style="font-size: 48px; margin-bottom: 10px;">⚠️</div>
      <div style="font-family: Arial, sans-serif; font-size: 24px; font-weight: bold; margin-bottom: 15px; color: #DC2626;">Warning: Phishing Website</div>
      <div style="font-family: Arial, sans-serif; font-size: 16px; margin-bottom: 20px;">
        Guardian Shield has detected that this website may be attempting to steal your information.
      </div>
      <div style="margin-bottom: 20px; text-align: left;">
        <div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 10px;">Detected issues:</div>
        <ul style="font-family: Arial, sans-serif; font-size: 14px; padding-left: 20px;">
          ${analysis.details.map(detail => `<li style="margin-bottom: 5px;">${detail}</li>`).join('')}
        </ul>
      </div>
      <button class="guardian-shield-leave-site" style="width: 100%; padding: 10px; background-color: #DC2626; color: white; border: none; border-radius: 4px; font-family: Arial, sans-serif; font-size: 14px; cursor: pointer; margin-bottom: 10px;">
        Leave this site
      </button>
      <button class="guardian-shield-view-anyway" style="width: 100%; padding: 10px; background-color: transparent; border: 1px solid #DC2626; color: #DC2626; border-radius: 4px; font-family: Arial, sans-serif; font-size: 14px; cursor: pointer;">
        View site anyway (not recommended)
      </button>
    </div>
  `;
  
  document.body.appendChild(overlay);
  
  // Add event listeners
  const leaveButton = overlay.querySelector('.guardian-shield-leave-site');
  leaveButton.addEventListener('click', () => {
    window.location.href = 'https://google.com';
  });
  
  const viewButton = overlay.querySelector('.guardian-shield-view-anyway');
  viewButton.addEventListener('click', () => {
    overlay.remove();
  });
}

// Show paste warning
function showPasteWarning(inputElement, pastedText, suspiciousFeatures) {
  // Create warning element
  const warning = document.createElement('div');
  warning.className = 'guardian-shield-paste-warning';
  warning.style.position = 'absolute';
  warning.style.backgroundColor = '#FEF2F2';
  warning.style.borderRadius = '4px';
  warning.style.padding = '10px';
  warning.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.2)';
  warning.style.zIndex = '10002';
  warning.style.maxWidth = '300px';
  warning.style.border = '1px solid #FCA5A5';
  
  // Add content
  warning.innerHTML = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; font-weight: bold; margin-bottom: 5px; display: flex; align-items: center; gap: 5px; color: #DC2626;">
      <span>⚠️</span> Suspicious content pasted
    </div>
    <div style="font-family: Arial, sans-serif; font-size: 12px; margin-bottom: 5px;">
      The URL you pasted may be dangerous:
    </div>
    <ul style="margin: 0 0 10px 0; padding-left: 20px; font-family: Arial, sans-serif; font-size: 12px;">
      ${suspiciousFeatures.map(feature => `<li>${feature}</li>`).join('')}
    </ul>
    <button class="guardian-shield-dismiss-paste-warning" style="padding: 5px 10px; font-family: Arial, sans-serif; font-size: 12px; background-color: #F3F4F6; border: none; border-radius: 4px; cursor: pointer;">
      Dismiss
    </button>
  `;
  
  // Position warning near the input element
  document.body.appendChild(warning);
  const inputRect = inputElement.getBoundingClientRect();
  warning.style.left = `${inputRect.left + window.scrollX}px`;
  warning.style.top = `${inputRect.bottom + window.scrollY + 5}px`;
  
  // Add dismissal logic
  const dismissButton = warning.querySelector('.guardian-shield-dismiss-paste-warning');
  dismissButton.addEventListener('click', () => {
    warning.remove();
  });
  
  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (document.body.contains(warning)) {
      warning.remove();
    }
  }, 8000);
}

// Show details modal for media analysis
function showDetailsModal(type, result) {
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'guardian-shield-details-modal';
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  modal.style.display = 'flex';
  modal.style.justifyContent = 'center';
  modal.style.alignItems = 'center';
  modal.style.zIndex = '10004';
  
  // Determine content based on type
  let title, confidenceDisplay, details, recommendations;
  
  if (type === 'audio') {
    title = 'AI-Generated Voice Analysis';
    confidenceDisplay = `${result.confidence}% confidence`;
    details = result.details;
    recommendations = result.recommendations;
  } else {
    title = 'Deepfake Video Analysis';
    confidenceDisplay = `${result.confidenceScore}% confidence`;
    details = result.details;
    recommendations = result.recommendations;
  }
  
  // Add content
  modal.innerHTML = `
    <div style="background-color: white; padding: 20px; border-radius: 8px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <div style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold;">${title}</div>
        <button class="guardian-shield-close-modal" style="background: none; border: none; font-size: 22px; cursor: pointer;">&times;</button>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #DC2626; font-weight: bold;">
          Detected as ${type === 'audio' ? 'AI-generated voice' : 'manipulated video'} (${confidenceDisplay})
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 10px;">Analysis details:</div>
        <ul style="font-family: Arial, sans-serif; font-size: 14px; padding-left: 20px;">
          ${details.map(detail => `<li style="margin-bottom: 5px;">${detail}</li>`).join('')}
        </ul>
      </div>
      
      <div>
        <div style="font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; margin-bottom: 10px;">Recommendations:</div>
        <ul style="font-family: Arial, sans-serif; font-size: 14px; padding-left: 20px;">
          ${recommendations.map(rec => `<li style="margin-bottom: 5px;">${rec}</li>`).join('')}
        </ul>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listener to close button
  const closeButton = modal.querySelector('.guardian-shield-close-modal');
  closeButton.addEventListener('click', () => {
    modal.remove();
  });
  
  // Close when clicking outside
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.remove();
    }
  });
}