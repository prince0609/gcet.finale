const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');
const { paginate, paginationResponse } = require('../utils/helpers');

const adminQueries = loadQueries('admin.sql');
const userQueries = loadQueries('users.sql');

// ============ Rental Period Types ============

const listRentalPeriods = async (req, res, next) => {
    try {
        const result = await db.query(adminQueries.listRentalPeriodTypes);
        res.json({ rentalPeriods: result.rows });
    } catch (error) {
        next(error);
    }
};

const createRentalPeriod = async (req, res, next) => {
    try {
        const { label, unit, isActive } = req.body;

        if (!label || !unit) {
            return res.status(400).json({ error: 'Label and unit are required' });
        }

        if (!['hour', 'day', 'week'].includes(unit)) {
            return res.status(400).json({ error: 'Unit must be hour, day, or week' });
        }

        const result = await db.query(adminQueries.createRentalPeriodType, [
            label, unit, isActive !== false
        ]);

        res.status(201).json({
            message: 'Rental period type created',
            rentalPeriod: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const updateRentalPeriod = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { label, unit, isActive } = req.body;

        if (unit && !['hour', 'day', 'week'].includes(unit)) {
            return res.status(400).json({ error: 'Unit must be hour, day, or week' });
        }

        const result = await db.query(adminQueries.updateRentalPeriodType, [
            id, label, unit, isActive
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rental period type not found' });
        }

        res.json({
            message: 'Rental period type updated',
            rentalPeriod: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const deleteRentalPeriod = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(adminQueries.deleteRentalPeriodType, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Rental period type not found' });
        }

        res.json({ message: 'Rental period type deleted' });
    } catch (error) {
        next(error);
    }
};

// ============ Tax Configurations ============

const listTaxConfigs = async (req, res, next) => {
    try {
        const result = await db.query(adminQueries.listTaxConfigurations);
        res.json({ taxConfigurations: result.rows });
    } catch (error) {
        next(error);
    }
};

const createTaxConfig = async (req, res, next) => {
    try {
        const { name, taxType, rate, isActive } = req.body;

        if (!name || !taxType || rate === undefined) {
            return res.status(400).json({ error: 'Name, taxType, and rate are required' });
        }

        if (!['IGST', 'CGST', 'SGST'].includes(taxType)) {
            return res.status(400).json({ error: 'Tax type must be IGST, CGST, or SGST' });
        }

        const result = await db.query(adminQueries.createTaxConfiguration, [
            name, taxType, rate, isActive !== false
        ]);

        res.status(201).json({
            message: 'Tax configuration created',
            taxConfiguration: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const updateTaxConfig = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, taxType, rate, isActive } = req.body;

        if (taxType && !['IGST', 'CGST', 'SGST'].includes(taxType)) {
            return res.status(400).json({ error: 'Tax type must be IGST, CGST, or SGST' });
        }

        const result = await db.query(adminQueries.updateTaxConfiguration, [
            id, name, taxType, rate, isActive
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tax configuration not found' });
        }

        res.json({
            message: 'Tax configuration updated',
            taxConfiguration: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const deleteTaxConfig = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(adminQueries.deleteTaxConfiguration, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tax configuration not found' });
        }

        res.json({ message: 'Tax configuration deleted' });
    } catch (error) {
        next(error);
    }
};

// ============ Product Attributes ============

const listProductAttributes = async (req, res, next) => {
    try {
        const result = await db.query(adminQueries.listProductAttributes);
        res.json({ productAttributes: result.rows });
    } catch (error) {
        next(error);
    }
};

const createProductAttribute = async (req, res, next) => {
    try {
        const { name, isActive } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const result = await db.query(adminQueries.createProductAttribute, [
            name, isActive !== false
        ]);

        res.status(201).json({
            message: 'Product attribute created',
            productAttribute: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const updateProductAttribute = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, isActive } = req.body;

        const result = await db.query(adminQueries.updateProductAttribute, [id, name, isActive]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product attribute not found' });
        }

        res.json({
            message: 'Product attribute updated',
            productAttribute: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const deleteProductAttribute = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(adminQueries.deleteProductAttribute, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product attribute not found' });
        }

        res.json({ message: 'Product attribute deleted' });
    } catch (error) {
        next(error);
    }
};

// ============ Attribute Values ============

const listAttributeValues = async (req, res, next) => {
    try {
        const result = await db.query(adminQueries.listAttributeValues);
        res.json({ attributeValues: result.rows });
    } catch (error) {
        next(error);
    }
};

const listAttributeValuesByAttribute = async (req, res, next) => {
    try {
        const { attributeId } = req.params;
        const result = await db.query(adminQueries.listAttributeValuesByAttribute, [attributeId]);
        res.json({ attributeValues: result.rows });
    } catch (error) {
        next(error);
    }
};

const createAttributeValue = async (req, res, next) => {
    try {
        const { attributeId, value } = req.body;

        if (!attributeId || !value) {
            return res.status(400).json({ error: 'Attribute ID and value are required' });
        }

        const result = await db.query(adminQueries.createAttributeValue, [attributeId, value]);

        res.status(201).json({
            message: 'Attribute value created',
            attributeValue: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const updateAttributeValue = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { value } = req.body;

        if (!value) {
            return res.status(400).json({ error: 'Value is required' });
        }

        const result = await db.query(adminQueries.updateAttributeValue, [id, value]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Attribute value not found' });
        }

        res.json({
            message: 'Attribute value updated',
            attributeValue: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const deleteAttributeValue = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(adminQueries.deleteAttributeValue, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Attribute value not found' });
        }

        res.json({ message: 'Attribute value deleted' });
    } catch (error) {
        next(error);
    }
};

// ============ User Management ============

const listUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { limit: queryLimit, offset } = paginate(page, limit);

        const [usersResult, countResult] = await Promise.all([
            db.query(userQueries.listAllUsers, [queryLimit, offset]),
            db.query(userQueries.countAllUsers)
        ]);

        res.json(paginationResponse(
            usersResult.rows,
            parseInt(countResult.rows[0].total),
            page,
            limit
        ));
    } catch (error) {
        next(error);
    }
};

const updateUserStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (isActive === undefined) {
            return res.status(400).json({ error: 'isActive is required' });
        }

        const result = await db.query(userQueries.updateUserStatus, [id, isActive]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// ============ Late Fee Policies ============

const listLateFeePolicies = async (req, res, next) => {
    try {
        const result = await db.query(adminQueries.listLateFeePolicies);
        res.json({ lateFeePolicies: result.rows });
    } catch (error) {
        next(error);
    }
};

const createLateFeePolicy = async (req, res, next) => {
    try {
        const { productId, gracePeriodDays, feePerDay, maxFeeMultiplier } = req.body;

        if (feePerDay === undefined) {
            return res.status(400).json({ error: 'feePerDay is required' });
        }

        const result = await db.query(adminQueries.createLateFeePolicy, [
            productId || null,
            gracePeriodDays || 1,
            feePerDay,
            maxFeeMultiplier || 2.00
        ]);

        res.status(201).json({
            message: 'Late fee policy created',
            lateFeePolicy: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const updateLateFeePolicy = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { gracePeriodDays, feePerDay, maxFeeMultiplier } = req.body;

        const result = await db.query(adminQueries.updateLateFeePolicy, [
            id, gracePeriodDays, feePerDay, maxFeeMultiplier
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Late fee policy not found' });
        }

        res.json({
            message: 'Late fee policy updated',
            lateFeePolicy: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listRentalPeriods,
    createRentalPeriod,
    updateRentalPeriod,
    deleteRentalPeriod,
    listTaxConfigs,
    createTaxConfig,
    updateTaxConfig,
    deleteTaxConfig,
    listProductAttributes,
    createProductAttribute,
    updateProductAttribute,
    deleteProductAttribute,
    listAttributeValues,
    listAttributeValuesByAttribute,
    createAttributeValue,
    updateAttributeValue,
    deleteAttributeValue,
    listUsers,
    updateUserStatus,
    listLateFeePolicies,
    createLateFeePolicy,
    updateLateFeePolicy
};
