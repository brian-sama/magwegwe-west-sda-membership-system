const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Test
const db = require('./db');

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/youth', require('./routes/youthRoutes'));
app.use('/api/society', require('./routes/societyRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));

// Serve Static Assets in Production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback for SPA routing
app.get('*', (req, res) => {
    const indexPath = path.resolve(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error("Error sending index.html:", err);
            res.status(500).send("Index file not found in " + distPath);
        }
    });
});

app.listen(PORT, async () => {
    try {
        await db.query("SELECT 1");
        console.log(`Server running on port ${PORT} - Private Network Access OK`);
        console.log(`Database connected successfully`);
    } catch (err) {
        console.error("Database connection failed:", err.message);
    }
});
