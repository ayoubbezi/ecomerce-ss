const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { Op } = require('sequelize');

// Create a new order
router.post('/', async (req, res) => {
  try {
    // Extract all fields except total
    const { name, email, phone, address, city, country, postal, paymentMethod, items } = req.body;
    // Get total separately so we can modify it
    let total = req.body.total;

    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'address', 'city', 'country', 'postal', 'paymentMethod', 'items'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    // Validate each item in the order
    for (const item of items) {
      if (!item.productId || !item.name || !item.price || !item.quantity) {
        return res.status(400).json({
          error: 'Each item must have productId, name, price, and quantity'
        });
      }
      if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return res.status(400).json({
          error: 'Item quantity must be a positive integer'
        });
      }
      if (typeof item.price !== 'number' || item.price <= 0) {
        return res.status(400).json({
          error: 'Item price must be a positive number'
        });
      }
    }

    // Calculate total if not provided or verify if provided total matches items
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    // Log calculated and provided totals for debugging
    console.log('Calculated Total:', calculatedTotal);
    console.log('Provided Total:', total);
    
    // Add shipping cost to the calculated total (5.00 is the standard shipping cost)
    const calculatedTotalWithShipping = calculatedTotal + 5.00;
    console.log('Calculated Total with Shipping:', calculatedTotalWithShipping);
    
    // Round both values to avoid floating point comparison issues
    const roundedCalculated = Math.round(calculatedTotalWithShipping * 100) / 100;
    const roundedProvided = Math.round(parseFloat(total) * 100) / 100;
    console.log('Rounded Calculated:', roundedCalculated);
    console.log('Rounded Provided:', roundedProvided);
    
    if (!total) {
      total = roundedCalculated;
    } else if (Math.abs(roundedProvided - roundedCalculated) > 0.10) { // Allow for small differences (10 cents)
      return res.status(400).json({
        error: `Provided total (${roundedProvided}) does not match calculated total (${roundedCalculated})`
      });
    } else {
      // Use the calculated total to ensure accuracy
      total = roundedCalculated;
    }

    // Create the order
    const order = await Order.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      country: country.trim(),
      postal: postal.trim(),
      paymentMethod,
      items: JSON.stringify(items), // Ensure items are stored as JSON string
      total: parseFloat(total),
      status: 'pending'
    });

    // Format the response
    const responseData = {
      ...order.toJSON(),
      items: JSON.parse(order.items), // Parse items back to array for response
      total: parseFloat(order.total)
    };

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error creating order: ' + error.message });
  }
});

// Get all orders with optional filtering
router.get('/', async (req, res) => {
  try {
    const { status, startDate, endDate, email } = req.query;
    const queryOptions = {
      where: {},
      order: [['createdAt', 'DESC']]
    };

    // Add status filter if provided
    if (status) {
      queryOptions.where.status = status;
    }

    // Add date range filter if provided
    if (startDate && endDate) {
      queryOptions.where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Add email filter if provided
    if (email) {
      queryOptions.where.email = email.toLowerCase();
    }

    const orders = await Order.findAll(queryOptions);

    // Format the response
    const formattedOrders = orders.map(order => ({
      ...order.toJSON(),
      items: JSON.parse(order.items), // Parse items back to array
      total: parseFloat(order.total),
      orderDate: order.createdAt
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders: ' + error.message });
  }
});

// Get a specific order by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Format the response
    const responseData = {
      ...order.toJSON(),
      items: JSON.parse(order.items), // Parse items back to array
      total: parseFloat(order.total)
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Error fetching order: ' + error.message });
  }
});

// Update order status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update the status
    await order.update({ status });

    // Format the response
    const responseData = {
      ...order.toJSON(),
      items: JSON.parse(order.items), // Parse items back to array
      total: parseFloat(order.total)
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Error updating order status: ' + error.message });
  }
});

module.exports = router;