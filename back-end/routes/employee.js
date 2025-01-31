// routes/employee.js
const express = require('express');
const router = express.Router();
const connection = require('../db');
const authenticateJWT = require('../authMiddleware');
const multer = require('multer');
const path = require('path');

// Middleware to check Employee role
const isEmployee = (req, res, next) => {
    if (req.user.role !== 'Employee') return res.sendStatus(403);
    next();
};

router.use(authenticateJWT, isEmployee);

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'USER-' + req.user.id + '-' + Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Upload photo
router.post('/upload', upload.single('photo'), (req, res) => {
    const query = 'INSERT INTO photos (user_id, photo_path) VALUES (?, ?)';
    connection.query(query, [req.user.id, req.file.filename], (err) => {
        if (err) return res.status(500).send(err);
        res.status(201).send('Photo uploaded successfully.');
    });
});

// View own photos
router.get('/photos', (req, res) => {
    const query = 'SELECT * FROM photos WHERE user_id = ?';
    connection.query(query, [req.user.id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).json(results);
    });
});

// Edit and delete own photos
// Implement routes as needed

module.exports = router;
