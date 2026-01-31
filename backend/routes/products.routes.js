const express = require('express');
const router = express.Router();
const productsController = require('../controllers/products.controller');
const { authenticate } = require('../middleware/auth');
const { isVendor, isAdminOrVendor } = require('../middleware/roles');
const { handleProductImage } = require('../middleware/upload');

// All product management routes require authentication
router.use(authenticate);
router.use(isAdminOrVendor);

// Product CRUD
router.get('/', productsController.listProducts);
router.post('/', isVendor, handleProductImage, productsController.createProduct);
router.get('/:id', productsController.getProduct);
router.put('/:id', handleProductImage, productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

// Publish/Unpublish
router.put('/:id/publish', productsController.togglePublish);

// Pricing
router.get('/:id/pricing', productsController.getProductPricing);
router.post('/:id/pricing', productsController.upsertProductPricing);
router.delete('/:id/pricing/:pricingId', productsController.deleteProductPricing);

// Variants
router.get('/:id/variants', productsController.getProductVariants);
router.post('/:id/variants', productsController.createVariant);
router.put('/:id/variants/:variantId', productsController.updateVariant);
router.delete('/:id/variants/:variantId', productsController.deleteVariant);

// Attribute Mapping
router.get('/:id/attributes', productsController.getProductAttributeMap);
router.post('/:id/attributes', productsController.mapAttributeToProduct);
router.delete('/:id/attributes/:attributeId', productsController.removeProductAttribute);

module.exports = router;
