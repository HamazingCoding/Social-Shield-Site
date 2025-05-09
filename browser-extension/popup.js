// Guardian Shield Extension
// Popup Script

// Default configuration
const defaultConfig = {
  enabled: true,
  enablePhishingDetection: true,
  enableDeepfakeDetection: true,
  enableVoiceDetection: true,
  alertLevel: 'medium',
  autoBlockThreats: true
};

// Stats
let stats = {
  threatsBlocked: 0,
  linksScanned: 0,
  mediaAnalyzed: 0
};

// DOM elements
const mainToggle = document.getElementById('main-toggle');
const phishingToggle = document.getElementById('phishing-toggle');
const deepfakeToggle = document.getElementById('deepfake-toggle');
const voiceToggle = document.getElementById('voice-toggle');
const autoblockToggle = document.getElementById('autoblock-toggle');
const alertOptions = document.querySelectorAll('.alert-option');
const alertLevelDisplay = document.getElementById('alert-level-display');
const threatsBlockedElement = document.getElementById('threats-blocked');
const linksScannedElement = document.getElementById('links-scanned');
const mediaAnalyzedElement = document.getElementById('media-analyzed');
const historyButton = document.getElementById('history-button');
const openSettingsLink = document.getElementById('open-settings');
const openHelpLink = document.getElementById('open-help');
const protectionStatus = document.getElementById('protection-status');
const statusIcon = document.getElementById('status-icon');
const statusTitle = document.getElementById('status-title');
const statusDescription = document.getElementById('status-description');

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  // Load configuration from storage
  chrome.storage.sync.get('config', (data) => {
    const config = data.config || defaultConfig;
    updateUI(config);
  });
  
  // Load stats from storage
  chrome.storage.local.get('stats', (data) => {
    stats = data.stats || stats;
    updateStats();
  });
  
  // Set up event listeners
  setupEventListeners();
});

// Update UI based on configuration
function updateUI(config) {
  // Update toggles
  mainToggle.checked = config.enabled;
  phishingToggle.checked = config.enablePhishingDetection;
  deepfakeToggle.checked = config.enableDeepfakeDetection;
  voiceToggle.checked = config.enableVoiceDetection;
  autoblockToggle.checked = config.autoBlockThreats;
  
  // Update alert level
  alertOptions.forEach(option => {
    option.classList.toggle('selected', option.dataset.level === config.alertLevel);
  });
  alertLevelDisplay.textContent = capitalizeFirstLetter(config.alertLevel);
  
  // Update protection status
  updateProtectionStatus(config.enabled);
  
  // Disable specific toggles if main protection is off
  const toggleDisabled = !config.enabled;
  phishingToggle.disabled = toggleDisabled;
  deepfakeToggle.disabled = toggleDisabled;
  voiceToggle.disabled = toggleDisabled;
  autoblockToggle.disabled = toggleDisabled;
  alertOptions.forEach(option => {
    option.style.pointerEvents = toggleDisabled ? 'none' : 'auto';
    option.style.opacity = toggleDisabled ? '0.5' : '1';
  });
}

// Update protection status UI
function updateProtectionStatus(enabled) {
  if (enabled) {
    protectionStatus.classList.remove('disabled');
    statusIcon.classList.remove('disabled');
    statusIcon.textContent = '✓';
    statusTitle.textContent = 'Protection Active';
    statusDescription.textContent = 'Guardian Shield is actively monitoring for threats.';
  } else {
    protectionStatus.classList.add('disabled');
    statusIcon.classList.add('disabled');
    statusIcon.textContent = '!';
    statusTitle.textContent = 'Protection Disabled';
    statusDescription.textContent = 'Toggle the switch to enable Guardian Shield protection.';
  }
}

// Update stats display
function updateStats() {
  threatsBlockedElement.textContent = stats.threatsBlocked;
  linksScannedElement.textContent = stats.linksScanned;
  mediaAnalyzedElement.textContent = stats.mediaAnalyzed;
}

// Setup event listeners
function setupEventListeners() {
  // Main toggle
  mainToggle.addEventListener('change', () => {
    updateConfig({ enabled: mainToggle.checked });
  });
  
  // Feature toggles
  phishingToggle.addEventListener('change', () => {
    updateConfig({ enablePhishingDetection: phishingToggle.checked });
  });
  
  deepfakeToggle.addEventListener('change', () => {
    updateConfig({ enableDeepfakeDetection: deepfakeToggle.checked });
  });
  
  voiceToggle.addEventListener('change', () => {
    updateConfig({ enableVoiceDetection: voiceToggle.checked });
  });
  
  autoblockToggle.addEventListener('change', () => {
    updateConfig({ autoBlockThreats: autoblockToggle.checked });
  });
  
  // Alert level options
  alertOptions.forEach(option => {
    option.addEventListener('click', () => {
      if (mainToggle.checked) {
        alertOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        alertLevelDisplay.textContent = capitalizeFirstLetter(option.dataset.level);
        updateConfig({ alertLevel: option.dataset.level });
      }
    });
  });
  
  // History button
  historyButton.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('history.html') });
  });
  
  // Settings and help links
  openSettingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
  });
  
  openHelpLink.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL('help.html') });
  });
}

// Update configuration in storage
function updateConfig(changes) {
  chrome.storage.sync.get('config', (data) => {
    const currentConfig = data.config || defaultConfig;
    const newConfig = { ...currentConfig, ...changes };
    
    chrome.storage.sync.set({ config: newConfig }, () => {
      updateUI(newConfig);
      
      // Send message to background script to update configuration
      chrome.runtime.sendMessage({
        action: 'updateConfig',
        data: changes
      });
    });
  });
}

// Helper: Capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}