'use strict';

// API URL
const API_URL = 'http://localhost:5000/api/products';

// Function to fetch products from the backend
async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Function to create a product card HTML
function createProductCard(product) {
  // Default image if product image is not available
  const defaultImage = './assets/images/products/jacket-3.jpg';
  const hoverImage = './assets/images/products/jacket-4.jpg';
  
  // Format price with 2 decimal places
  const price = parseFloat(product.price).toFixed(2);
  
  // Create a random discount for demo purposes (between 10% and 30%)
  const discount = Math.floor(Math.random() * 21) + 10;
  const originalPrice = (price * (100 / (100 - discount))).toFixed(2);
  
  return `
    <div class="showcase">
      <div class="showcase-banner">
        <img src="${product.image || defaultImage}" alt="${product.title}" width="300" class="product-img default">
        <img src="${hoverImage}" alt="${product.title}" width="300" class="product-img hover">
        
        <p class="showcase-badge">${discount}%</p>
        
        <div class="showcase-actions">
          <button class="btn-action">
            <ion-icon name="heart-outline"></ion-icon>
          </button>
          
          <button class="btn-action">
            <ion-icon name="eye-outline"></ion-icon>
          </button>
          
          <button class="btn-action">
            <ion-icon name="repeat-outline"></ion-icon>
          </button>
          
          <button class="btn-action">
            <ion-icon name="bag-add-outline"></ion-icon>
          </button>
        </div>
      </div>
      
      <div class="showcase-content">
        <a href="#" class="showcase-category">${product.category || 'product'}</a>
        
        <a href="#">
          <h3 class="showcase-title">${product.title}</h3>
        </a>
        
        <div class="showcase-rating">
          <ion-icon name="star"></ion-icon>
          <ion-icon name="star"></ion-icon>
          <ion-icon name="star"></ion-icon>
          <ion-icon name="star-outline"></ion-icon>
          <ion-icon name="star-outline"></ion-icon>
        </div>
        
        <div class="price-box">
          <p class="price">$${price}</p>
          <del>$${originalPrice}</del>
        </div>
      </div>
    </div>
  `;
}

// Function to display products in the product grid
async function displayProducts() {
  const productGrid = document.querySelector('.product-grid');
  if (!productGrid) return;
  
  try {
    // Show loading state
    productGrid.innerHTML = '<p>Loading products...</p>';
    
    // Fetch products from the backend
    const products = await fetchProducts();
    
    if (products.length === 0) {
      productGrid.innerHTML = '<p>No products available.</p>';
      return;
    }
    
    // Clear the product grid
    productGrid.innerHTML = '';
    
    // Add each product to the grid
    products.forEach(product => {
      productGrid.innerHTML += createProductCard(product);
    });
  } catch (error) {
    console.error('Error displaying products:', error);
    productGrid.innerHTML = '<p>Error loading products. Please try again later.</p>';
  }
}

// Initialize products when the DOM is loaded
document.addEventListener('DOMContentLoaded', displayProducts); 