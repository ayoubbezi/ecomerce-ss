// Script to update API URLs for production deployment

const API_BASE_URL = 'https://biogold-api.onrender.com';

// Function to update localStorage after page loads
function updateApiUrlsInCode() {
  // Store the production API URL in localStorage for components to use
  localStorage.setItem('apiBaseUrl', API_BASE_URL);
  
  console.log('API URL has been set to production endpoint:', API_BASE_URL);
  
  // Check if we need to replace existing localhost URLs in fetch calls
  const pageContent = document.documentElement.innerHTML;
  if (pageContent.includes('http://localhost:5000')) {
    console.log('This page contains localhost URLs that need to be updated at runtime');
  }
}

// Function to get the API base URL (used throughout the app)
function getApiUrl() {
  return localStorage.getItem('apiBaseUrl') || 'http://localhost:5000';
}

// Update fetch calls at runtime
const originalFetch = window.fetch;
window.fetch = function(url, options) {
  // Replace localhost URLs with production URL
  if (url && typeof url === 'string' && url.includes('http://localhost:5000')) {
    url = url.replace('http://localhost:5000', API_BASE_URL);
    console.log('Updated fetch URL to:', url);
  }
  return originalFetch.call(this, url, options);
};

// Execute when DOM is loaded
document.addEventListener('DOMContentLoaded', updateApiUrlsInCode);

// Export for use in other files
window.getApiUrl = getApiUrl; 