// This script fixes path issues when deployed to Netlify
document.addEventListener('DOMContentLoaded', function() {
  // Get the base URL of the current deployment
  const baseUrl = window.location.origin;
  console.log('Current base URL:', baseUrl);
  
  // Fix CSS links by making them absolute if they're relative
  const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
  cssLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('./')) {
      const newHref = href.replace('./', `${baseUrl}/`);
      console.log(`Fixing CSS path: ${href} → ${newHref}`);
      link.setAttribute('href', newHref);
    }
  });
  
  // Fix image sources
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('./')) {
      const newSrc = src.replace('./', `${baseUrl}/`);
      console.log(`Fixing image path: ${src} → ${newSrc}`);
      img.setAttribute('src', newSrc);
    }
  });
  
  // Fix favicon
  const favicon = document.querySelector('link[rel="shortcut icon"]');
  if (favicon) {
    const href = favicon.getAttribute('href');
    if (href && href.startsWith('./')) {
      const newHref = href.replace('./', `${baseUrl}/`);
      console.log(`Fixing favicon path: ${href} → ${newHref}`);
      favicon.setAttribute('href', newHref);
    }
  }
  
  // Store the site URL for future reference
  localStorage.setItem('siteBaseUrl', baseUrl);
}); 