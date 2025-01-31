const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // To hash the admin password

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'employee_management',
});

connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database.');

    // Create database if not exists
    connection.query('CREATE DATABASE IF NOT EXISTS employee_management', (err) => {
        if (err) throw err;
        console.log('Database created or already exists.');

        // Switch to the database
        connection.changeUser({ database: 'employee_management' }, (err) => {
            if (err) throw err;

            // Create tables
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(255) UNIQUE,
                    password VARCHAR(255),
                    role ENUM('Admin', 'Manager', 'Employee'),
                    manager_id INT,
                    FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
                )
            `;

            const createPhotosTable = `
                CREATE TABLE IF NOT EXISTS photos (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id INT,
                    photo_path VARCHAR(255),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                )
            `;

            // Create users table
            connection.query(createUsersTable, (err) => {
                if (err) throw err;
                console.log('Users table ready.');

                // Check if there's already an admin user
                const checkAdminQuery = `SELECT COUNT(*) AS adminCount FROM users WHERE role = 'Admin'`;
                connection.query(checkAdminQuery, (err, results) => {
                    if (err) throw err;

                    const { adminCount } = results[0];

                    if (adminCount === 0) {
                        // No admin found, insert a default admin user
                        const username = 'admin';
                        const password = 'admin123'; // Default password
                        const hashedPassword = bcrypt.hashSync(password, 10); // Hash the password

                        const insertAdminQuery = `
                            INSERT INTO users (username, password, role) 
                            VALUES (?, ?, 'Admin')
                        `;
                        connection.query(insertAdminQuery, [username, hashedPassword], (err) => {
                            if (err) throw err;
                            console.log('Default admin user created with username "admin" and password "admin123".');
                        });
                    } else {
                        console.log('Admin user already exists.');
                    }
                });
            });

            // Create photos table
            connection.query(createPhotosTable, (err) => {
                if (err) throw err;
                console.log('Photos table ready.');
            });
        });
    });
});

module.exports = connection;
