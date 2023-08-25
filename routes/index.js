const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const config = require('config');
const JWT_SECRET = process.env.JWT_SECRET || config.get('JWT_SECRET');
const jwt = require('jsonwebtoken');
const Joi = require('@hapi/joi')
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');

const userSignupValidate = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    number: Joi.string().required(),
    image: Joi.string(),
    username: Joi.string().required(),
    password: Joi.string().required(),
    location: Joi.string(),
    description: Joi.string()
});
const userLoginValidate = Joi.object({
    email: Joi.string(),
    username: Joi.string(),
    password: Joi.string().required()
})
router.post('/signup', async (req, res) => {
    console.log(await req.body)
    // check allowed params
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "number", "image", "username", "password", "location", "description"];
    const isValidOperations = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperations) {
        return res.status(400).json({ success: false, message: 'Invalid API Paramaters' });
    }

    // check empty body 
    if (Object.keys(req.body).length < 1) {
        return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    // validate api params for empty values
    const { error } = userSignupValidate.validate(req.body);
    if (error) {
        return res.status(400).send({
            success: false,
            message: error.details[0].message
        });
    }
    let { name, email, number, image, username, password, location, description } = req.body
    try {

        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).send({
                success: false,
                message: "Email already exists"
            })
        }
        let userEmail = await User.findOne({ username })
        if (userEmail) {
            return res.status(400).json({
                success: false,
                message: "Username already exists"
            });
        };
        let userNumber = await User.findOne({ number })
        if (userNumber) {
            return res.status(400).json({
                success: false,
                message: "Username already exists"
            });
        };
        user = await new User({
            name, email, number, image, username, password, location, description
        });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);


        user.password = hash;

        await user.save()


        const payload = {
            user: {
                email,
                id: user.id
            }
        };

        const token = await jwt.sign(payload, JWT_SECRET, {
            expiresIn: "365d"
        });
        return res.json({
            success: true,
            user,
            token,
            message: "User registered successfully",
        });
    }
    catch (error) {
        console.log('Error:', error.message);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
})

router.post('/login', async (req, res) => {


    let { email, password, username } = req.body;
    // check allowed params
    const updates = Object.keys(req.body);
    const allowedUpdates = ["email", "username", "password"];
    const isValidOperations = updates.every((update) => allowedUpdates.includes(update));
    if (!isValidOperations) {
        return res.status(400).json({ success: false, message: 'Invalid API Paramaters' });
    }

    // check empty body 
    if (Object.keys(req.body).length < 1) {
        return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    // validate api params for empty values
    const { error } = userLoginValidate.validate(req.body);
    if (error) {
        return res.status(400).send({
            success: false,
            message: error.details[0].message
        });
    }

    try {
        let user;
        if (typeof (username) == "undefined") {
            email = email.toLowerCase();
            email = await email.split(" ").join("");
            user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide valid email"
                });
            }
        }
        else {
            user = await User.findOne({ username })
            
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide valid Username"
                });
            }
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid password"
            });
        }

        const payload = {
            user: {
                email: user.email,
                id: user._id
            }
        };

        const token = await jwt.sign(payload, JWT_SECRET, {
            expiresIn: "365d"
        });

        user.password="It's always a mystery"
        return res.json({
            success: true,
            token,
            user
        });

    } catch (error) {
        console.log('Error:', error.message);
        res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
});

module.exports = router;