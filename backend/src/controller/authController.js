const passport = require('passport');
const config = require('../../core/config')
const User = require('../models/user');
const {body, validationResult} = require('express-validator');

const register = async ( req,res,next) => {
    try {
        const errors = validationResult(req);
        
        if(!errors.isEmpty()){
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const {username, email,password} = req.body;

        const user = await User.create({
            username:username.trim(),
            email:email.toLowerCase().trim(),
            password
        });
        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error(' Registration error:', error);
        if (error.message.includes('Username already exists')) {
            return res.status(409).json({
                error: 'Username already exists',
                message: 'This username is already taken'
            });
        }
        
        if (error.message.includes('Email already exists')) {
            return res.status(409).json({
                error: 'Email already exists',
                message: 'An account with this email already exists'
            });
        }

        res.status(500).json({
            error: 'Registration failed',
            message: 'An error occurred during registration'
        });
    }
}

const login = (req,res,next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    passport.authenticate('local',(error,user,info) => {
        if(error){
            console.error('Login authentication error:', error);
            return next(error);
        }
        if(!user){
            console.log(`Login failed: ${info.message}`);
            return res.status(401).json({
                error: 'Authentication failed',
                message: info.message || 'Invalid email or password'
            });
        }
        req.login(user, (error) => {
            if (error) {
                console.error('Login session creation failed:', error);
                return next(error);
            }

            console.log(`User logged in: ${user.username} (${user.email})`);

            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        });
    })(req, res, next);
};

const logout = (req, res, next) => {
    const username = req.user?.username;

    req.logout((error) => {
        if (error) {
            console.error('Logout error:', error);
            return next(error);
        }
        req.session.destroy((error) => {
            if (error) {
                console.error('Session destruction error:', error);
                return next(error);
            }

            console.log(`User logged out: ${username}`);
            
            res.json({
                message: 'Logout successful'
            });
        });
    });
};

module.exports = {
    register,
    login,
    logout,
};