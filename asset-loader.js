// Dynamic asset loader script for BioGold e-commerce site
// Helps load CSS and assets properly in both local and deployed environments

(function() {
  // Determine the base URL based on the environment
  function getBaseUrl() {
    const isNetlify = window.location.hostname.includes('netlify.app');
    return isNetlify ? window.location.origin : '.';
  }
  
  // Function to load CSS with the correct path
  function loadCss(cssPath) {
    // Skip if already loaded
    const existingLinks = document.querySelectorAll(`link[href*="${cssPath.split('/').pop()}"]`);
    if (existingLinks.length > 0) return;
    
    // Create a new link element
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `${getBaseUrl()}/${cssPath.replace(/^\.\//,'')}`;
    
    // Add to head
    document.head.appendChild(link);
    console.log(`Loaded CSS: ${link.href}`);
  }
  
  // Function to ensure image paths are correct
  function fixImageSrc(img) {
    const src = img.getAttribute('src');
    if (src && src.startsWith('./')) {
      const newSrc = `${getBaseUrl()}/${src.substring(2)}`;
      img.setAttribute('src', newSrc);
    }
  }
  
  // Load essential CSS files
  document.addEventListener('DOMContentLoaded', function() {
    // Load core CSS files
    loadCss('./assets/css/style.css');
    loadCss('./assets/css/gold-theme.css');
    
    // Fix any image paths that might be already in the DOM
    document.querySelectorAll('img').forEach(fixImageSrc);
    
    // Also ensure any favicon links are correct
    const favicon = document.querySelector('link[rel="shortcut icon"]');
    if (favicon) {
      const href = favicon.getAttribute('href');
      if (href && href.startsWith('./')) {
        favicon.setAttribute('href', `${getBaseUrl()}/${href.substring(2)}`);
      }
    }
    
    console.log('Asset paths checked and fixed if needed');
  });
  
  // Expose functions globally for use in other scripts
  window.biogoldAssets = {
    getBaseUrl,
    loadCss,
    fixImageSrc
  };
})(); 