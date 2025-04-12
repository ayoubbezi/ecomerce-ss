const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const sequelize = require('./config/database');
const Product = require('./models/Product');
const Category = require('./models/Category');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

// API Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
// Register orders route
app.use('/api/orders', require('./routes/orders'));
// Register contacts route
app.use('/api/contacts', require('./routes/contacts'));

// Serve static files for production
if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, '../')));
    
    // Handle React routing, return all requests to the app
    app.get('*', (req, res) => {
        // Check if the request is for an HTML file
        if (req.headers.accept && req.headers.accept.includes('text/html')) {
            // Map specific paths to their HTML files
            const htmlFiles = {
                '/': 'index.html',
                '/cart': 'cart.html',
                '/wishlist': 'wishlist.html',
                '/product-details': 'product-details.html',
            };
            
            const path_name = req.path.split('/')[1];
            const file = htmlFiles[`/${path_name}`] || htmlFiles['/'];
            
            res.sendFile(path.join(__dirname, '../', file));
        } else {
            // For API requests or other non-HTML requests
            res.status(404).json({ error: 'Not found' });
        }
    });
} else {
    // For development, just serve the static files
    app.use(express.static(path.join(__dirname, '../')));
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!', details: err.message });
});

const PORT = process.env.PORT || 5000;

// Database connection with retry logic
async function connectToDatabase() {
    let retries = 5;
    while (retries) {
        try {
            await sequelize.authenticate();
            console.log('Database connection has been established successfully.');
            
            // Sync all models with database
            await sequelize.sync({ alter: true });
            console.log('Database synced successfully');
            return true;
        } catch (error) {
            console.error('Unable to connect to the database:', error);
            retries -= 1;
            console.log(`Retries left: ${retries}`);
            // Wait for a few seconds before retrying
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    return false;
}

// Sync database and start server
async function startServer() {
    try {
        const dbConnected = await connectToDatabase();
        if (!dbConnected) {
            console.error('Failed to connect to database after multiple retries');
            process.exit(1);
        }
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
}

startServer();
