// Guardian Shield Extension
// History Page Script

// DOM elements
const historyContainer = document.getElementById('history-container');
const paginationContainer = document.getElementById('pagination');
const typeFilter = document.getElementById('type-filter');
const resultFilter = document.getElementById('result-filter');
const dateFromFilter = document.getElementById('date-from');
const dateToFilter = document.getElementById('date-to');
const applyFiltersButton = document.getElementById('apply-filters');
const detailsModal = document.getElementById('details-modal');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');
const closeModalButton = document.getElementById('close-modal');
const closeModalButtonFooter = document.getElementById('close-modal-button');

// Pagination settings
const ITEMS_PER_PAGE = 10;
let currentPage = 1;
let filteredHistory = [];

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
  // Load history data
  loadHistoryData();
  
  // Set up event listeners
  setupEventListeners();
  
  // Set default date range (last 30 days)
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  dateToFilter.valueAsDate = today;
  dateFromFilter.valueAsDate = thirtyDaysAgo;
});

// Load history data from storage
function loadHistoryData() {
  chrome.storage.local.get('analysisHistory', (data) => {
    const history = data.analysisHistory || [];
    
    // Apply initial filters
    applyFilters(history);
  });
}

// Set up event listeners
function setupEventListeners() {
  // Apply filters button
  applyFiltersButton.addEventListener('click', () => {
    loadHistoryData();
  });
  
  // Close modal buttons
  closeModalButton.addEventListener('click', () => {
    detailsModal.style.display = 'none';
  });
  
  closeModalButtonFooter.addEventListener('click', () => {
    detailsModal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  detailsModal.addEventListener('click', (event) => {
    if (event.target === detailsModal) {
      detailsModal.style.display = 'none';
    }
  });
}

// Apply filters to history data
function applyFilters(history) {
  const typeValue = typeFilter.value;
  const resultValue = resultFilter.value;
  const fromDate = dateFromFilter.valueAsDate ? new Date(dateFromFilter.valueAsDate) : null;
  const toDate = dateToFilter.valueAsDate ? new Date(dateToFilter.valueAsDate) : null;
  
  // Set time to end of day for toDate
  if (toDate) {
    toDate.setHours(23, 59, 59, 999);
  }
  
  filteredHistory = history.filter(item => {
    // Filter by type
    if (typeValue !== 'all' && item.type !== typeValue) {
      return false;
    }
    
    // Filter by result
    if (resultValue === 'threat') {
      // For phishing
      if (item.type === 'url' && !item.result.isPhishing) {
        return false;
      }
      // For deepfake
      else if (item.type === 'video' && item.result.isAuthentic) {
        return false;
      }
      // For voice
      else if (item.type === 'audio' && !item.result.isAI) {
        return false;
      }
    } else if (resultValue === 'safe') {
      // For phishing
      if (item.type === 'url' && item.result.isPhishing) {
        return false;
      }
      // For deepfake
      else if (item.type === 'video' && !item.result.isAuthentic) {
        return false;
      }
      // For voice
      else if (item.type === 'audio' && item.result.isAI) {
        return false;
      }
    }
    
    // Filter by date
    const itemDate = new Date(item.timestamp);
    if (fromDate && itemDate < fromDate) {
      return false;
    }
    if (toDate && itemDate > toDate) {
      return false;
    }
    
    return true;
  });
  
  // Reset to first page when applying filters
  currentPage = 1;
  
  // Render history table and pagination
  renderHistoryTable();
  renderPagination();
}

// Render history table
function renderHistoryTable() {
  if (filteredHistory.length === 0) {
    // Show empty state
    historyContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📊</div>
        <h3 class="empty-title">No history found</h3>
        <p class="empty-description">
          No analysis history matching your filters was found.
          Try adjusting your filters or browse more sites to generate analysis data.
        </p>
      </div>
    `;
    return;
  }
  
  // Calculate pagination
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedHistory = filteredHistory.slice(startIndex, endIndex);
  
  // Create table
  let tableHTML = `
    <table class="history-table">
      <thead>
        <tr>
          <th>Date & Time</th>
          <th>Type</th>
          <th>Content</th>
          <th>Result</th>
          <th>Confidence</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Add rows
  paginatedHistory.forEach((item, index) => {
    const date = new Date(item.timestamp);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();
    
    // Determine type display name
    let typeName;
    switch (item.type) {
      case 'url':
        typeName = 'Phishing';
        break;
      case 'video':
        typeName = 'Deepfake';
        break;
      case 'audio':
        typeName = 'Voice';
        break;
      default:
        typeName = item.type.charAt(0).toUpperCase() + item.type.slice(1);
    }
    
    // Determine result and confidence
    let result, resultClass, confidence;
    
    if (item.type === 'url') {
      result = item.result.isPhishing ? 'Phishing Detected' : 'Safe';
      resultClass = item.result.isPhishing ? 'status-threat' : 'status-safe';
      confidence = item.result.confidence || 0;
    } else if (item.type === 'video') {
      result = item.result.isAuthentic ? 'Authentic' : 'Deepfake Detected';
      resultClass = item.result.isAuthentic ? 'status-safe' : 'status-threat';
      confidence = item.result.confidenceScore || 0;
    } else if (item.type === 'audio') {
      result = item.result.isAI ? 'AI Voice Detected' : 'Human Voice';
      resultClass = item.result.isAI ? 'status-threat' : 'status-safe';
      confidence = item.result.confidence || 0;
    }
    
    tableHTML += `
      <tr>
        <td>${formattedDate}<br>${formattedTime}</td>
        <td>${typeName}</td>
        <td class="content-col" title="${item.content}">${item.content}</td>
        <td><span class="status-badge ${resultClass}">${result}</span></td>
        <td>${confidence}%</td>
        <td>
          <button class="action-button" data-index="${startIndex + index}">View Details</button>
        </td>
      </tr>
    `;
  });
  
  tableHTML += `
      </tbody>
    </table>
  `;
  
  historyContainer.innerHTML = tableHTML;
  
  // Add event listeners to view details buttons
  const detailButtons = document.querySelectorAll('.action-button');
  detailButtons.forEach(button => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index);
      showDetailsModal(filteredHistory[index]);
    });
  });
}

// Render pagination
function renderPagination() {
  if (filteredHistory.length === 0) {
    paginationContainer.innerHTML = '';
    return;
  }
  
  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  
  let paginationHTML = '';
  
  // Previous page button
  paginationHTML += `
    <button class="page-button ${currentPage === 1 ? 'disabled' : ''}" 
      ${currentPage === 1 ? 'disabled' : ''} data-page="prev">
      &lt; Previous
    </button>
  `;
  
  // Page buttons
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  // Adjust if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  
  // First page
  if (startPage > 1) {
    paginationHTML += `
      <button class="page-button" data-page="1">1</button>
    `;
    
    if (startPage > 2) {
      paginationHTML += `<span class="page-ellipsis">...</span>`;
    }
  }
  
  // Page numbers
  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="page-button ${i === currentPage ? 'active' : ''}" data-page="${i}">
        ${i}
      </button>
    `;
  }
  
  // Last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span class="page-ellipsis">...</span>`;
    }
    
    paginationHTML += `
      <button class="page-button" data-page="${totalPages}">${totalPages}</button>
    `;
  }
  
  // Next page button
  paginationHTML += `
    <button class="page-button ${currentPage === totalPages ? 'disabled' : ''}" 
      ${currentPage === totalPages ? 'disabled' : ''} data-page="next">
      Next &gt;
    </button>
  `;
  
  paginationContainer.innerHTML = paginationHTML;
  
  // Add event listeners to pagination buttons
  const pageButtons = document.querySelectorAll('.page-button:not([disabled])');
  pageButtons.forEach(button => {
    button.addEventListener('click', () => {
      const page = button.dataset.page;
      
      if (page === 'prev') {
        currentPage--;
      } else if (page === 'next') {
        currentPage++;
      } else {
        currentPage = parseInt(page);
      }
      
      renderHistoryTable();
      renderPagination();
      
      // Scroll to top of history container
      historyContainer.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// Show details modal
function showDetailsModal(item) {
  // Set modal title
  let titleText = '';
  
  if (item.type === 'url') {
    titleText = 'Phishing Analysis Details';
  } else if (item.type === 'video') {
    titleText = 'Deepfake Analysis Details';
  } else if (item.type === 'audio') {
    titleText = 'Voice Analysis Details';
  }
  
  modalTitle.textContent = titleText;
  
  // Create modal content
  let modalContent = '';
  
  // Analysis date and time
  const date = new Date(item.timestamp);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString();
  
  modalContent += `
    <div class="detail-section">
      <div class="detail-item">
        <div class="detail-label">Date:</div>
        <div class="detail-value">${formattedDate} ${formattedTime}</div>
      </div>
  `;
  
  // Content information
  modalContent += `
      <div class="detail-item">
        <div class="detail-label">Content:</div>
        <div class="detail-value">${item.content}</div>
      </div>
  `;
  
  // Result information
  if (item.type === 'url') {
    const resultText = item.result.isPhishing ? 'Phishing Detected' : 'Safe';
    const resultClass = item.result.isPhishing ? 'status-threat' : 'status-safe';
    
    modalContent += `
      <div class="detail-item">
        <div class="detail-label">Result:</div>
        <div class="detail-value">
          <span class="status-badge ${resultClass}">${resultText}</span>
        </div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Confidence:</div>
        <div class="detail-value">${item.result.confidence || 0}%</div>
      </div>
    </div>
    `;
  } else if (item.type === 'video') {
    const resultText = item.result.isAuthentic ? 'Authentic' : 'Deepfake Detected';
    const resultClass = item.result.isAuthentic ? 'status-safe' : 'status-threat';
    
    modalContent += `
      <div class="detail-item">
        <div class="detail-label">Result:</div>
        <div class="detail-value">
          <span class="status-badge ${resultClass}">${resultText}</span>
        </div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Confidence:</div>
        <div class="detail-value">${item.result.confidenceScore || 0}%</div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Manipulation Markers:</div>
        <div class="detail-value">${item.result.manipulationMarkers || 0}</div>
      </div>
    </div>
    `;
  } else if (item.type === 'audio') {
    const resultText = item.result.isAI ? 'AI Voice Detected' : 'Human Voice';
    const resultClass = item.result.isAI ? 'status-threat' : 'status-safe';
    
    modalContent += `
      <div class="detail-item">
        <div class="detail-label">Result:</div>
        <div class="detail-value">
          <span class="status-badge ${resultClass}">${resultText}</span>
        </div>
      </div>
      <div class="detail-item">
        <div class="detail-label">Confidence:</div>
        <div class="detail-value">${item.result.confidence || 0}%</div>
      </div>
    </div>
    `;
  }
  
  // Details
  if (item.result.details && item.result.details.length > 0) {
    modalContent += `
      <div class="detail-section">
        <h3 class="detail-title">Analysis Details</h3>
        <ul class="detail-list">
    `;
    
    item.result.details.forEach(detail => {
      modalContent += `<li>${detail}</li>`;
    });
    
    modalContent += `
        </ul>
      </div>
    `;
  }
  
  // Recommendations
  if (item.result.recommendations && item.result.recommendations.length > 0) {
    modalContent += `
      <div class="detail-section">
        <h3 class="detail-title">Recommendations</h3>
        <ul class="detail-list">
    `;
    
    item.result.recommendations.forEach(recommendation => {
      modalContent += `<li>${recommendation}</li>`;
    });
    
    modalContent += `
        </ul>
      </div>
    `;
  }
  
  modalBody.innerHTML = modalContent;
  
  // Show modal
  detailsModal.style.display = 'flex';
}