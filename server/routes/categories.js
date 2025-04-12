const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Helper function to generate slug from name
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// Get all categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Error fetching categories' });
    }
});

// Create a new category
router.post('/', async (req, res) => {
    try {
        console.log('Received category data:', req.body); // Debug log
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        // Generate slug from name
        const slug = generateSlug(name);
        console.log('Generated slug:', slug); // Debug log

        // Create category with generated slug
        const category = await Category.create({
            name,
            description,
            slug
        });

        console.log('Category created:', category); // Debug log
        res.status(201).json(category);
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ 
            error: 'Error creating category',
            details: error.message 
        });
    }
});

// Delete a category
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await Category.destroy({
            where: { id }
        });
        
        if (deleted) {
            res.json({ message: 'Category deleted successfully' });
        } else {
            res.status(404).json({ error: 'Category not found' });
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Error deleting category' });
    }
});

module.exports = router; 