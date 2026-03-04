const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = users[0];

        // In a real app, compare hash. For migration of existing mock data, we might need a strategy.
        // Assuming new users are created with hashed passwords.
        // const match = await bcrypt.compare(password, user.password_hash);

        // TEMPORARY: Simple check if password_hash matches plain text (for initial setup) 
        // OR if using bcrypt (recommended):
        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '8h' }
        );

        // Update last login
        await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                lastLogin: new Date()
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
