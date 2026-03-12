const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, checkRole } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM youth_members ORDER BY last_name');
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
            INSERT INTO youth_members (
                id, first_name, last_name, dob, parent_name, 
                parent_phone, grade, club, rank, health_notes, registration_date
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        `;
        const values = [
            d.id, d.first_name, d.last_name, d.dob, d.parent_name,
            d.parent_phone, d.grade, d.club, d.rank, d.health_notes, d.registration_date
        ];

        const { rows } = await db.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
