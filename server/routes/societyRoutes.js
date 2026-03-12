const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, checkRole } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM society_members ORDER BY last_name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', auth, checkRole(['ADMIN', 'CLERK']), async (req, res) => {
    try {
        const d = req.body;
        if (!d.id) d.id = Date.now().toString();

        const query = `
            INSERT INTO society_members (
                id, first_name, last_name, national_id, phone, 
                type, skills, registration_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
        `;
        const values = [
            d.id, d.first_name, d.last_name, d.national_id, d.phone,
            d.type, d.skills, d.registration_date
        ];

        const { rows } = await db.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
