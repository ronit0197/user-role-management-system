// routes/auth.js
const express = require('express');
const router = express.Router();
const connection = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticateJWT = require('../authMiddleware');

// Register route (Admin only)
router.post('/register', (req, res) => {
    console.log(req.body); // Add this line to check the request payload

    const { username, password, role, manager_id } = req.body;

    if (!password) {
        return res.status(400).send('Password is required');
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const query = 'INSERT INTO users (username, password, role, manager_id) VALUES (?, ?, ?, ?)';
    connection.query(query, [username, hashedPassword, role, manager_id || null], (err) => {
        if (err) return res.status(500).send(err);
        res.status(201).send('User registered successfully.');
    });
});


// Login route
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    connection.query(query, [username], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send('User not found.');

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) return res.status(401).send('Invalid password.');

        const token = jwt.sign({ id: user.id, role: user.role }, 'a3b9c8f47d3cbb5c6282b0e0f9af6b2e9b54e193cf7f784ab76d5f6e1c9da49a72849f8f3f6d3d28574ecf5b72b4c9b11c7ebd0a9176b21db82e', {
            expiresIn: 86400, // 24 hours
        });

        res.status(200).send({ auth: true, token });
    });
});


// User information
router.get('/me', authenticateJWT, (req, res) => {
    const userId = req.user.id;

    const query = 'SELECT id, username, role, manager_id FROM users WHERE id = ?';
    connection.query(query, [userId], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.status(404).send('User not found.');

        const user = results[0];
        res.status(200).send({
            id: user.id,
            username: user.username,
            role: user.role,
            manager_id: user.manager_id
        });
    });
});

module.exports = router;
