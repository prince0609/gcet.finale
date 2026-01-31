const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roles');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

// Rental Period Types
router.get('/rental-periods', adminController.listRentalPeriods);
router.post('/rental-periods', adminController.createRentalPeriod);
router.put('/rental-periods/:id', adminController.updateRentalPeriod);
router.delete('/rental-periods/:id', adminController.deleteRentalPeriod);

// Tax Configurations
router.get('/tax-configurations', adminController.listTaxConfigs);
router.post('/tax-configurations', adminController.createTaxConfig);
router.put('/tax-configurations/:id', adminController.updateTaxConfig);
router.delete('/tax-configurations/:id', adminController.deleteTaxConfig);

// Product Attributes
router.get('/product-attributes', adminController.listProductAttributes);
router.post('/product-attributes', adminController.createProductAttribute);
router.put('/product-attributes/:id', adminController.updateProductAttribute);
router.delete('/product-attributes/:id', adminController.deleteProductAttribute);

// Attribute Values
router.get('/attribute-values', adminController.listAttributeValues);
router.get('/attribute-values/:attributeId', adminController.listAttributeValuesByAttribute);
router.post('/attribute-values', adminController.createAttributeValue);
router.put('/attribute-values/:id', adminController.updateAttributeValue);
router.delete('/attribute-values/:id', adminController.deleteAttributeValue);

// User Management
router.get('/users', adminController.listUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

// Late Fee Policies
router.get('/late-fee-policies', adminController.listLateFeePolicies);
router.post('/late-fee-policies', adminController.createLateFeePolicy);
router.put('/late-fee-policies/:id', adminController.updateLateFeePolicy);

module.exports = router;
