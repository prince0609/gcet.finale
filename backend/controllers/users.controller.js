const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');
const { validatePassword, validateGSTIN, sanitizeString } = require('../utils/validators');

const userQueries = loadQueries('users.sql');
const authQueries = loadQueries('auth.sql');

/**
 * GET /api/users/profile
 * Get current user's profile
 */
const getProfile = async (req, res, next) => {
    try {
        const result = await db.query(userQueries.getUserProfile, [req.user.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = result.rows[0];

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.is_active,
            createdAt: user.created_at,
            ...(user.company_id && {
                company: {
                    id: user.company_id,
                    name: user.company_name,
                    gstin: user.gstin
                }
            })
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/users/profile
 * Update current user's profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const { name, companyName, gstin } = req.body;

        // Update user name
        if (name) {
            await db.query(userQueries.updateUserProfile, [req.user.id, sanitizeString(name)]);
        }

        // Update company info for vendors
        if (req.user.role === 'vendor' && (companyName || gstin)) {
            if (gstin && !validateGSTIN(gstin)) {
                return res.status(400).json({ error: 'Invalid GSTIN format' });
            }

            // Check if company exists
            const companyResult = await db.query(userQueries.getCompanyByUserId, [req.user.id]);

            if (companyResult.rows.length > 0) {
                await db.query(userQueries.updateCompany, [
                    req.user.id,
                    companyName ? sanitizeString(companyName) : null,
                    gstin ? gstin.toUpperCase() : null
                ]);
            } else if (companyName && gstin) {
                await db.query(userQueries.createCompany, [
                    req.user.id,
                    sanitizeString(companyName),
                    gstin.toUpperCase()
                ]);
            }
        }

        // Get updated profile
        const result = await db.query(userQueries.getUserProfile, [req.user.id]);
        const user = result.rows[0];

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                ...(user.company_id && {
                    company: {
                        id: user.company_id,
                        name: user.company_name,
                        gstin: user.gstin
                    }
                })
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/users/change-password
 * Change password
 */
const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({ error: 'New password must be at least 8 characters long' });
        }

        if (confirmPassword && newPassword !== confirmPassword) {
            return res.status(400).json({ error: 'Passwords do not match' });
        }

        // Get current user with password
        const userResult = await db.query(authQueries.findUserByEmail, [req.user.email]);
        const user = userResult.rows[0];

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // Update password
        await db.query(authQueries.updatePassword, [passwordHash, req.user.id]);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/users/addresses
 * Get user's addresses
 */
const getAddresses = async (req, res, next) => {
    try {
        const result = await db.query(userQueries.getUserAddresses, [req.user.id]);
        res.json({ addresses: result.rows });
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/users/addresses
 * Create a new address
 */
const createAddress = async (req, res, next) => {
    try {
        const { label, addressType, line1, line2, city, state, pincode, country, isDefault } = req.body;

        if (!line1 || !city || !state || !pincode) {
            return res.status(400).json({ error: 'Address line1, city, state, and pincode are required' });
        }

        const type = addressType || 'both';
        if (!['billing', 'shipping', 'both'].includes(type)) {
            return res.status(400).json({ error: 'Invalid address type' });
        }

        // If setting as default, clear other defaults
        if (isDefault) {
            await db.query(userQueries.clearDefaultAddresses, [req.user.id, type]);
        }

        const result = await db.query(userQueries.createAddress, [
            req.user.id,
            label || null,
            type,
            sanitizeString(line1),
            line2 ? sanitizeString(line2) : null,
            sanitizeString(city),
            sanitizeString(state),
            pincode,
            country || 'India',
            isDefault || false
        ]);

        res.status(201).json({
            message: 'Address created successfully',
            address: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/users/addresses/:id
 * Update an address
 */
const updateAddress = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { label, addressType, line1, line2, city, state, pincode, country, isDefault } = req.body;

        // Verify address belongs to user
        const existingResult = await db.query(userQueries.getAddressById, [id, req.user.id]);
        if (existingResult.rows.length === 0) {
            return res.status(404).json({ error: 'Address not found' });
        }

        // If setting as default, clear other defaults
        if (isDefault) {
            const type = addressType || existingResult.rows[0].address_type;
            await db.query(userQueries.clearDefaultAddresses, [req.user.id, type]);
        }

        const result = await db.query(userQueries.updateAddress, [
            id,
            req.user.id,
            label,
            addressType,
            line1 ? sanitizeString(line1) : null,
            line2 !== undefined ? (line2 ? sanitizeString(line2) : null) : undefined,
            city ? sanitizeString(city) : null,
            state ? sanitizeString(state) : null,
            pincode,
            country,
            isDefault
        ]);

        res.json({
            message: 'Address updated successfully',
            address: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/users/addresses/:id
 * Delete an address
 */
const deleteAddress = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await db.query(userQueries.deleteAddress, [id, req.user.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Address not found' });
        }

        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress
};
