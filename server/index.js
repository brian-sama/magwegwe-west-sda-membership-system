const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { auth, checkRole } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Essential for Express to detect HTTPS behind Nginx proxy
app.set('trust proxy', 1);

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
app.use('/api/users', auth, checkRole(['ADMIN']), require('./routes/userRoutes'));
app.use('/api/logs', auth, require('./routes/logRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Serve Static Assets in Production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback for SPA routing
app.get('*', (req, res) => {
    const indexPath = path.resolve(distPath, 'index.html');
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.warn("Index file not found in " + distPath + ", serving as API only.");
            res.status(404).send("Frontend not built. Please run 'npm run build' in the root directory.");
        }
    });
});

app.listen(PORT, async () => {
    try {
        await db.query("SELECT 1");
        console.log(`Server running on port ${PORT}`);
        console.log(`Database connected successfully to ${process.env.DB_NAME} on ${process.env.DB_HOST}`);
    } catch (err) {
        console.error("CRITICAL: Database connection failed!");
        console.error("Error details:", err.message);
        console.error("Check your .env file and ensure the database is running.");
    }
});
