const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// Submit a new contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        error: 'Name, email, and message are required fields'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Create the contact entry
    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
      isRead: false
    });

    res.status(201).json({
      success: true,
      message: 'Contact message submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting contact message:', error);
    res.status(500).json({ error: 'Error submitting contact message: ' + error.message });
  }
});

// Get all contact messages
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(contacts);
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    res.status(500).json({ error: 'Error fetching contact messages: ' + error.message });
  }
});

// Mark a contact message as read
router.patch('/:id/read', async (req, res) => {
  try {
    const contactId = req.params.id;
    const contact = await Contact.findByPk(contactId);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found' });
    }
    
    await contact.update({ isRead: true });
    res.json({ success: true });
  } catch (error) {
    console.error('Error marking contact as read:', error);
    res.status(500).json({ error: 'Error marking contact as read: ' + error.message });
  }
});

// Delete a contact message
router.delete('/:id', async (req, res) => {
  try {
    const contactId = req.params.id;
    const contact = await Contact.findByPk(contactId);
    
    if (!contact) {
      return res.status(404).json({ error: 'Contact message not found' });
    }
    
    await contact.destroy();
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact message:', error);
    res.status(500).json({ error: 'Error deleting contact message: ' + error.message });
  }
});

module.exports = router; 