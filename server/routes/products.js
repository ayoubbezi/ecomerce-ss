const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Category = require('../models/Category');
const { Op } = require('sequelize');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../../assets/images/products');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Generate unique filename while preserving original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `product-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    // Accept only image files with specific extensions
    const allowedTypes = /jpeg|jpg|png|gif/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(ext);

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files (jpeg, jpg, png, gif) are allowed!'));
  }
});

// Add new product
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, stock, categoryId } = req.body;
    
    // Validate required fields
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({ error: 'Valid price greater than 0 is required' });
    }
    
    // Validate stock if provided
    const stockValue = parseInt(stock);
    if (stock && (isNaN(stockValue) || stockValue < 0)) {
      return res.status(400).json({ error: 'Stock must be a non-negative number' });
    }

    // Check if category exists if categoryId is provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ error: 'Invalid category ID' });
      }
    }
    
    const productData = {
      title: title.trim(),
      description: description ? description.trim() : null,
      price: parseFloat(price),
      stock: stockValue || 0,
      CategoryId: categoryId || null
    };
    
    // Add image path if an image was uploaded
    if (req.file) {
      productData.image = `/assets/images/products/${req.file.filename}`;
    }
    
    const newProduct = await Product.create(productData);
    
    // Fetch the created product with its category
    const createdProduct = await Product.findByPk(newProduct.id, {
      include: [{
        model: Category,
        attributes: ['id', 'name', 'slug']
      }]
    });
    
    res.status(201).json(createdProduct);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Error creating product: ' + err.message });
  }
});

// Get all products with optional filtering
router.get('/', async (req, res) => {
  try {
    const { categoryId, search, limit, offset } = req.query;
    const queryOptions = {
      include: [{
        model: Category,
        attributes: ['id', 'name', 'slug']
      }],
      where: {}
    };

    // Add category filter if provided
    if (categoryId) {
      queryOptions.where.CategoryId = categoryId;
    }

    // Add search filter if provided
    if (search) {
      queryOptions.where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Add pagination if provided
    if (limit) {
      queryOptions.limit = parseInt(limit);
    }
    if (offset) {
      queryOptions.offset = parseInt(offset);
    }

    const products = await Product.findAll(queryOptions);
    
    // Format the response
    const formattedProducts = products.map(product => {
      const productJson = product.toJSON();
      return {
        ...productJson,
        price: parseFloat(productJson.price), // Ensure price is a number
        image: productJson.image ? 
          (productJson.image.startsWith('http') ? productJson.image : `http://localhost:5000${productJson.image}`)
          : null
      };
    });
    
    res.json(formattedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Error fetching products: ' + error.message });
  }
});

// Get a single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{
        model: Category,
        attributes: ['id', 'name', 'slug']
      }]
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Format the response
    const productJson = product.toJSON();
    const responseData = {
      ...productJson,
      price: parseFloat(productJson.price), // Ensure price is a number
      image: productJson.image ? 
        (productJson.image.startsWith('http') ? productJson.image : `http://localhost:5000${productJson.image}`)
        : null,
      category: productJson.Category ? productJson.Category.name : 'Uncategorized'
    };
    
    res.json(responseData);
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ error: 'Error fetching product: ' + err.message });
  }
});

// Delete a product
router.delete('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    
    // Find the product first to get the image path
    const product = await Product.findByPk(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete the image file if it exists
    if (product.image) {
      const imagePath = path.join(__dirname, '../..', product.image);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
        } catch (unlinkError) {
          console.error('Error deleting product image:', unlinkError);
          // Continue with product deletion even if image deletion fails
        }
      }
    }
    
    // Delete the product from the database
    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Error deleting product: ' + error.message });
  }
});

module.exports = router;
