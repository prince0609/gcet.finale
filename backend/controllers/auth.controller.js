const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');
const { validateEmail, validatePassword, validateRequired, validateGSTIN, sanitizeString } = require('../utils/validators');
const { generateToken } = require('../utils/helpers');

const authQueries = loadQueries('auth.sql');
const userQueries = loadQueries('users.sql');

// Email transporter (configure in production)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

/**
 * POST /api/auth/signup
 * Register a new user
 */
const signup = async (req, res, next) => {
    try {
        const { name, email, password, confirmPassword, role, companyName, gstin } = req.body;

        // Validate required fields
        const missing = validateRequired(['name', 'email', 'password'], req.body);
        if (missing.length > 0) {
            return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` });
        }

        // Validate email format
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password
        if (!validatePassword(password)) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        // Validate password confirmation
        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Validate role
        const userRole = role || 'customer';
        if (!['customer', 'vendor'].includes(userRole)) {
            return res.status(400).json({ error: 'Invalid role. Must be customer or vendor' });
        }

        // Vendors must provide company info
        if (userRole === 'vendor') {
            if (!companyName || !gstin) {
                return res.status(400).json({ error: 'Vendors must provide company name and GSTIN' });
            }
            if (!validateGSTIN(gstin)) {
                return res.status(400).json({ error: 'Invalid GSTIN format' });
            }
        }

        // Check if email already exists
        const existingUser = await db.query(authQueries.findUserByEmail, [email.toLowerCase()]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const userResult = await db.query(authQueries.createUser, [
            sanitizeString(name),
            email.toLowerCase(),
            passwordHash,
            userRole
        ]);

        const user = userResult.rows[0];

        // Create company for vendors
        if (userRole === 'vendor') {
            await db.query(userQueries.createCompany, [
                user.id,
                sanitizeString(companyName),
                gstin.toUpperCase()
            ]);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/login
 * User login
 */
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const result = await db.query(authQueries.findUserByEmail, [email.toLowerCase()]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Check if user is active
        if (!user.is_active) {
            return res.status(401).json({ error: 'Account is deactivated. Please contact support.' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Find user by email
        const result = await db.query(authQueries.findUserByEmail, [email.toLowerCase()]);

        // Don't reveal if email exists
        if (result.rows.length === 0) {
            return res.json({ message: 'If the email exists, a reset link will be sent' });
        }

        const user = result.rows[0];

        // Invalidate old tokens
        await db.query(authQueries.invalidateOldResetTokens, [user.id]);

        // Generate reset token
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 3600000); // 1 hour

        await db.query(authQueries.createPasswordResetToken, [
            user.id,
            token,
            expiresAt
        ]);

        // Send email (in production)
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

        try {
            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: user.email,
                subject: 'Password Reset Request',
                html: `
                    <h1>Password Reset</h1>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                    <p>This link expires in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `
            });
        } catch (emailError) {
            console.error('Email send error:', emailError);
            // Don't fail the request if email fails in development
        }

        res.json({
            message: 'If the email exists, a reset link will be sent',
            // Include token in development for testing
            ...(process.env.NODE_ENV === 'development' && { token, resetUrl })
        });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/auth/reset-password
 * Reset password using token
 */
const resetPassword = async (req, res, next) => {
    try {
        const { token, password, confirmPassword } = req.body;

        if (!token || !password) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' });
        }

        if (confirmPassword && password !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Find valid token
        const tokenResult = await db.query(authQueries.findValidResetToken, [token]);
        if (tokenResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const resetToken = tokenResult.rows[0];

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Update password
        await db.query(authQueries.updatePassword, [passwordHash, resetToken.user_id]);

        // Mark token as used
        await db.query(authQueries.markResetTokenUsed, [resetToken.id]);

        res.json({ message: 'Password reset successful. You can now login with your new password.' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    signup,
    login,
    forgotPassword,
    resetPassword
};
