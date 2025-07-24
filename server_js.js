const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies
app.use(express.static('.')); // Serve static files from current directory

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'order_tracker.html'));
});

// API route to get order statuses
app.get('/api/order-statuses', (req, res) => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'order_statuses.json'), 'utf8');
        const jsonData = JSON.parse(data);
        res.json(jsonData);
    } catch (error) {
        console.error('Error reading order_statuses.json:', error);
        res.status(500).json({ error: 'Failed to read order statuses' });
    }
});

// API route to update order statuses (if you want to add new entries)
app.post('/api/order-statuses', (req, res) => {
    try {
        // Read current data
        const data = fs.readFileSync(path.join(__dirname, 'order_statuses.json'), 'utf8');
        const jsonData = JSON.parse(data);
        
        // Add new entry
        const newEntry = {
            StartTime: (Date.now() / 86400000 + 25569).toString(), // Convert to Excel date format
            WorkOrder: req.body.WorkOrder,
            PartNumber: req.body.PartNumber,
            Station: req.body.Station,
            Status: req.body.Status,
            ProductLine: req.body.ProductLine
        };
        
        jsonData.body.push(newEntry);
        
        // Write back to file
        fs.writeFileSync(path.join(__dirname, 'order_statuses.json'), JSON.stringify(jsonData, null, 2));
        
        res.json({ success: true, entry: newEntry });
    } catch (error) {
        console.error('Error updating order_statuses.json:', error);
        res.status(500).json({ error: 'Failed to update order statuses' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 Order Tracker available at http://localhost:${PORT}`);
    console.log(`🔧 API endpoints:`);
    console.log(`   GET  /api/order-statuses - Get all order statuses`);
    console.log(`   POST /api/order-statuses - Add new order status`);
    console.log(`   GET  /health - Health check`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 Server shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 Server shutting down gracefully...');
    process.exit(0);
});