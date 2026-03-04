const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 100');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', async (req, res) => {
    const { userId, userName, action, details } = req.body;
    try {
        const id = Date.now().toString();
        await db.query('INSERT INTO audit_logs (id, user_id, user_name, action, details) VALUES (?, ?, ?, ?, ?)',
            [id, userId, userName, action, details]);
        res.status(201).json({ message: 'Log recorded' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
