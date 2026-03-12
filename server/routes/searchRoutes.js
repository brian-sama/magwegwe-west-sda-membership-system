const express = require('express');
const router = express.Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

router.get('/global', auth, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
        const queryStr = `%${q}%`;
        const { rows: members } = await db.query('SELECT id, first_name, last_name, \'MEMBER\' as type FROM members WHERE first_name ILIKE $1 OR last_name ILIKE $2', [queryStr, queryStr]);
        const { rows: youth } = await db.query('SELECT id, first_name, last_name, \'YOUTH\' as type FROM youth_members WHERE first_name ILIKE $1 OR last_name ILIKE $2', [queryStr, queryStr]);
        const { rows: society } = await db.query('SELECT id, first_name, last_name, \'SOCIETY\' as type FROM society_members WHERE first_name ILIKE $1 OR last_name ILIKE $2', [queryStr, queryStr]);

        res.json([...members, ...youth, ...society]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
