const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth, checkRole } = require('../middleware/auth');

// GET all members
router.get('/', auth, async (req, res) => {
    try {
        const { rows } = await db.query('SELECT * FROM members ORDER BY last_name, first_name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new member
router.post('/', auth, checkRole(['ADMIN', 'CLERK']), async (req, res) => {
    const member = req.body;
    try {
        if (!member.id) member.id = Date.now().toString();

        const query = `
            INSERT INTO members (
                id, first_name, last_name, national_id, email, phone, status, 
                department, baptism_date, previous_church, destination_church, 
                transfer_date, board_approval_date, address, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `;
        const values = [
            member.id, member.first_name, member.last_name, member.national_id, member.email, member.phone, member.status,
            member.department, member.baptism_date, member.previous_church, member.destination_church,
            member.transfer_date, member.board_approval_date, member.address, member.notes
        ];

        const { rows } = await db.query(query, values);
        res.status(201).json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update member
router.put('/:id', auth, checkRole(['ADMIN', 'CLERK']), async (req, res) => {
    const member = req.body;
    try {
        const query = `
            UPDATE members SET 
                first_name = $1, last_name = $2, national_id = $3, email = $4, 
                phone = $5, status = $6, department = $7, baptism_date = $8, 
                previous_church = $9, destination_church = $10, transfer_date = $11, 
                board_approval_date = $12, address = $13, notes = $14
            WHERE id = $15
        `;
        const values = [
            member.first_name, member.last_name, member.national_id, member.email, member.phone, member.status,
            member.department, member.baptism_date, member.previous_church, member.destination_church,
            member.transfer_date, member.board_approval_date, member.address, member.notes,
            req.params.id
        ];

        await db.query(query, values);
        res.json({ message: 'Member updated', id: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE member
router.delete('/:id', auth, checkRole(['ADMIN', 'CLERK']), async (req, res) => {
    try {
        await db.query('DELETE FROM members WHERE id = $1', [req.params.id]);
        res.json({ message: 'Member deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
