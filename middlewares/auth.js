const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../models/User');

// environment variable setup
const JWT_SECRET = process.env.JWT_SECRET || config.get('JWT_SECRET');

module.exports = async (req, res, next) => {

    // get token from header and check
    const token = req.header('x-auth-token');

    // check token in header
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied', success: false });
    }

    try {
        // verify token
        const decoded = await jwt.verify(token, JWT_SECRET);

        // check user in dataabase for security purpose
        let existingUser = await User.findById(decoded.user.id);
        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "Token is not valid"
            });
        }

        // set user object in req
        req.user = decoded.user;
        next();

    } catch (error) {

        console.log('Error:', error.message);
        res.status(401).json({ message: 'Token is not valid', success: false })

    }
};