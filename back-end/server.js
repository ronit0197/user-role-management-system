// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connection = require('./db');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Serve the upload folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const managerRoutes = require('./routes/manager');
const employeeRoutes = require('./routes/employee');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/manager', managerRoutes);
app.use('/employee', employeeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
