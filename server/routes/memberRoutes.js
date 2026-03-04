const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all members
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM members ORDER BY last_name, first_name');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST new member
router.post('/', async (req, res) => {
    const member = req.body;
    try {
        const [result] = await db.query('INSERT INTO members SET ?', member);
        res.status(201).json({ id: result.insertId, ...member });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update member
router.put('/:id', async (req, res) => {
    try {
        await db.query('UPDATE members SET ? WHERE id = ?', [req.body, req.params.id]);
        res.json({ message: 'Member updated', id: req.params.id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE member (logic delete or actual)
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM members WHERE id = ?', [req.params.id]);
        res.json({ message: 'Member deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
