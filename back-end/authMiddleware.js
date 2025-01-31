// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization; // Get the Authorization header
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
        jwt.verify(token, 'a3b9c8f47d3cbb5c6282b0e0f9af6b2e9b54e193cf7f784ab76d5f6e1c9da49a72849f8f3f6d3d28574ecf5b72b4c9b11c7ebd0a9176b21db82e', (err, user) => {
            if (err) return res.sendStatus(403);

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

module.exports = authenticateJWT;
