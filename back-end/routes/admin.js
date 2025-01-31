// routes/admin.js
const express = require('express');
const router = express.Router();
const connection = require('../db');
const authenticateJWT = require('../authMiddleware');
const bcrypt = require('bcryptjs');

// Middleware to check Admin role
const isAdmin = (req, res, next) => {

    if (req.user.role !== 'Admin') return res.sendStatus(403);
    next();
};

router.use(authenticateJWT, isAdmin);

// Get all managers and their employees
router.get('/managers', (req, res) => {
    const query = `
    SELECT u.id AS manager_id, u.username AS manager_username, e.id AS employee_id, e.username AS employee_username
    FROM users u
    LEFT JOIN users e ON u.id = e.manager_id
    WHERE u.role = 'Manager'
  `;
    connection.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).json(results);
    });
});

// Assign an employee to a manager (Admin only)
router.post('/assign-manager', (req, res) => {
    const { employeeId, managerId } = req.body;

    if (!employeeId || !managerId) {
        return res.status(400).json({ message: 'Employee ID and Manager ID are required.' });
    }

    // Check if manager exists and is a Manager
    const checkManagerQuery = `SELECT id FROM users WHERE id = ? AND role = 'Manager'`;
    connection.query(checkManagerQuery, [managerId], (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid Manager ID' });
        }

        // Assign the employee to the manager by updating the manager_id
        const assignQuery = `UPDATE users SET manager_id = ? WHERE id = ? AND role = 'Employee'`;
        connection.query(assignQuery, [managerId, employeeId], (err, results) => {
            if (err) return res.status(500).send(err);

            if (results.affectedRows === 0) {
                return res.status(400).json({ message: 'Employee ID is invalid or the user is not an Employee' });
            }

            res.status(200).json({ message: 'Employee assigned to Manager successfully' });
        });
    });
});

// Create a new user (Admin only)
router.post('/create-user', (req, res) => {
    const { username, password, role, manager_id } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password, and role are required.' });
    }

    if (!['Admin', 'Manager', 'Employee'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role. Must be Admin, Manager, or Employee.' });
    }

    // Hash the password before storing
    const hashedPassword = bcrypt.hashSync(password, 8);

    const query = 'INSERT INTO users (username, password, role, manager_id) VALUES (?, ?, ?, ?)';
    connection.query(query, [username, hashedPassword, role, manager_id || null], (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(201).json({ message: 'User created successfully', userId: results.insertId });
    });
});

// View all users with their roles (Admin only)
router.get('/users', (req, res) => {
    const query = `
        SELECT u.id, u.username, u.role, u.manager_id, m.username AS manager_username
        FROM users u
        LEFT JOIN users m ON u.manager_id = m.id
    `;
    connection.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).json(results);
    });
});

// View a particular user by ID (excluding Admins)
router.get('/user/:id', (req, res) => {
    const userId = parseInt(req.params.id);

    const query = `
        SELECT u.id, u.username, u.role, u.manager_id, m.username AS manager_username
        FROM users u
        LEFT JOIN users m ON u.manager_id = m.id
        WHERE u.id = ? AND u.role != 'Admin'
    `;
    connection.query(query, [userId], (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found or is an Admin' });
        }

        res.status(200).json(results[0]);
    });
});

// Update a user (Admin only)
router.put('/update-user/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const { username, password, role, manager_id } = req.body;

    if (!username && !password && !role && manager_id === undefined) {
        return res.status(400).json({ message: 'At least one field (username, password, role, or manager_id) is required to update.' });
    }

    let updateFields = [];
    let queryParams = [];

    if (username) {
        updateFields.push('username = ?');
        queryParams.push(username);
    }
    if (password) {
        const hashedPassword = bcrypt.hashSync(password, 8);
        updateFields.push('password = ?');
        queryParams.push(hashedPassword);
    }
    if (role) {
        if (!['Manager', 'Employee'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be Manager or Employee.' });
        }
        updateFields.push('role = ?');
        queryParams.push(role);
    }
    if (manager_id !== undefined) {
        updateFields.push('manager_id = ?');
        queryParams.push(manager_id);
    }

    queryParams.push(userId);

    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ? AND role != 'Admin'`;
    connection.query(updateQuery, queryParams, (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or cannot be updated.' });
        }

        res.status(200).json({ message: 'User updated successfully' });
    });
});


// Delete a user (Admin only)
router.delete('/delete-user/:id', (req, res) => {
    const userId = parseInt(req.params.id);

    const deleteQuery = 'DELETE FROM users WHERE id = ? AND role != \'Admin\'';
    connection.query(deleteQuery, [userId], (err, results) => {
        if (err) return res.status(500).send(err);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or cannot be deleted.' });
        }

        res.status(200).json({ message: 'User deleted successfully' });
    });
});

module.exports = router;
