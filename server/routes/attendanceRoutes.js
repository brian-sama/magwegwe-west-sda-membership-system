const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM attendance ORDER BY date DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const data = req.body;
        if (!data.id) data.id = Date.now().toString();
        await db.query('INSERT INTO attendance (id, member_id, event_type, date, status) VALUES ($1, $2, $3, $4, $5)', 
            [data.id, data.member_id, data.event_type, data.date, data.status]);
        res.status(201).json({ id: data.id, ...data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/scan', auth, async (req, res) => {
    try {
        const { qr_payload, event_type, date } = req.body;
        // Simple scan logic: qr_payload is the member ID
        const memberId = qr_payload;
        const id = Date.now().toString();

        await db.query('INSERT INTO attendance (id, member_id, event_type, date, status) VALUES ($1, $2, $3, $4, $5)',
            [id, memberId, event_type, date, 'PRESENT']);

        res.status(201).json({ message: 'Scanned successfully', id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
