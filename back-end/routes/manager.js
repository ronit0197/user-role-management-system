const express = require('express');
const router = express.Router();
const connection = require('../db');
const authenticateJWT = require('../authMiddleware');

// Middleware to check Manager role
const isManager = (req, res, next) => {
    if (req.user.role !== 'Manager') return res.sendStatus(403);
    next();
};

router.use(authenticateJWT, isManager);

// Get employees under the manager
router.get('/employees', (req, res) => {
    const query = 'SELECT id, username FROM users WHERE manager_id = ?';
    connection.query(query, [req.user.id], (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).json(results);
    });
});

// View all photos of a specific employee under the manager
router.get('/employees/:employeeId/photos', (req, res) => {
    const { employeeId } = req.params;

    // Check if the employee belongs to the manager
    const employeeQuery = 'SELECT id FROM users WHERE id = ? AND manager_id = ?';
    connection.query(employeeQuery, [employeeId, req.user.id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.sendStatus(403); // Not authorized to view this employee

        // If the employee belongs to the manager, fetch their photos
        const photoQuery = 'SELECT id, photo_path FROM photos WHERE user_id = ?';
        connection.query(photoQuery, [employeeId], (err, photos) => {
            if (err) return res.status(500).send(err);
            res.status(200).json(photos);
        });
    });
});

// Delete a specific photo of an employee under the manager
router.delete('/employees/:employeeId/photos/:photoId', (req, res) => {
    const { employeeId, photoId } = req.params;

    // Check if the employee belongs to the manager
    const employeeQuery = 'SELECT id FROM users WHERE id = ? AND manager_id = ?';
    connection.query(employeeQuery, [employeeId, req.user.id], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length === 0) return res.sendStatus(403); // Not authorized to delete this employee's photo

        // If the employee belongs to the manager, delete the photo
        const deleteQuery = 'DELETE FROM photos WHERE id = ? AND user_id = ?';
        connection.query(deleteQuery, [photoId, employeeId], (err) => {
            if (err) return res.status(500).send(err);
            res.status(200).json({ message: 'Photo deleted successfully' });
        });
    });
});

module.exports = router;
