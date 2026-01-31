const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');
const { paginate, paginationResponse } = require('../utils/helpers');
const { sanitizeString } = require('../utils/validators');

const productQueries = loadQueries('products.sql');

/**
 * GET /api/products
 * List vendor's products
 */
const listProducts = async (req, res, next) => {
    try {
        const vendorId = req.user.role === 'admin' ? req.query.vendorId : req.user.id;

        if (!vendorId) {
            return res.status(400).json({ error: 'Vendor ID is required for admin' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const { limit: queryLimit, offset } = paginate(page, limit);

        const [productsResult, countResult] = await Promise.all([
            db.query(productQueries.listVendorProducts, [vendorId, queryLimit, offset]),
            db.query(productQueries.countVendorProducts, [vendorId])
        ]);

        res.json(paginationResponse(
            productsResult.rows,
            parseInt(countResult.rows[0].total),
            page,
            limit
        ));
    } catch (error) {
        next(error);
    }
};

/**
 * POST /api/products
 * Create a new product
 */
const createProduct = async (req, res, next) => {
    try {
        const { name, sku, isRentable, costPrice, salesPrice, qtyOnHand, isPublished, description } = req.body;

        if (!name || !sku || costPrice === undefined || salesPrice === undefined) {
            return res.status(400).json({ error: 'Name, SKU, costPrice, and salesPrice are required' });
        }

        // Handle image URL if file was uploaded
        let imageUrl = null;
        if (req.file) {
            imageUrl = `/uploads/products/${req.file.filename}`;
        }

        const result = await db.query(productQueries.createProduct, [
            req.user.id,
            sanitizeString(name),
            sku,
            isRentable !== false,
            costPrice,
            salesPrice,
            qtyOnHand || 0,
            isPublished || false,
            description ? sanitizeString(description) : null,
            imageUrl
        ]);

        res.status(201).json({
            message: 'Product created successfully',
            product: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/products/:id
 * Get product details
 */
const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.role === 'admin' ? null : req.user.id;

        let result;
        if (vendorId) {
            result = await db.query(productQueries.getProductByIdForVendor, [id, vendorId]);
        } else {
            result = await db.query(productQueries.getProductById, [id]);
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Get pricing and variants
        const [pricingResult, variantsResult, attributesResult] = await Promise.all([
            db.query(productQueries.getProductPricing, [id]),
            db.query(productQueries.getProductVariants, [id]),
            db.query(productQueries.getProductAttributes, [id])
        ]);

        res.json({
            product: result.rows[0],
            pricing: pricingResult.rows,
            variants: variantsResult.rows,
            attributes: attributesResult.rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/products/:id
 * Update a product
 */
const updateProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.role === 'admin' ? (await db.query(productQueries.getProductById, [id])).rows[0]?.vendor_id : req.user.id;

        const { name, sku, isRentable, costPrice, salesPrice, qtyOnHand, isPublished, description } = req.body;

        // Handle image URL if file was uploaded
        let imageUrl = undefined;
        if (req.file) {
            imageUrl = `/uploads/products/${req.file.filename}`;
        }

        const result = await db.query(productQueries.updateProduct, [
            id,
            vendorId,
            name ? sanitizeString(name) : null,
            sku,
            isRentable,
            costPrice,
            salesPrice,
            qtyOnHand,
            isPublished,
            description !== undefined ? (description ? sanitizeString(description) : null) : undefined,
            imageUrl
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({
            message: 'Product updated successfully',
            product: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

/**
 * DELETE /api/products/:id
 * Delete a product
 */
const deleteProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vendorId = req.user.role === 'admin' ? (await db.query(productQueries.getProductById, [id])).rows[0]?.vendor_id : req.user.id;

        const result = await db.query(productQueries.deleteProduct, [id, vendorId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * PUT /api/products/:id/publish
 * Toggle product publish status
 */
const togglePublish = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { isPublished } = req.body;
        const vendorId = req.user.role === 'admin' ? (await db.query(productQueries.getProductById, [id])).rows[0]?.vendor_id : req.user.id;

        if (isPublished === undefined) {
            return res.status(400).json({ error: 'isPublished is required' });
        }

        const result = await db.query(productQueries.publishProduct, [id, vendorId, isPublished]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({
            message: `Product ${isPublished ? 'published' : 'unpublished'} successfully`,
            product: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

// ============ Pricing ============

const getProductPricing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(productQueries.getProductPricing, [id]);
        res.json({ pricing: result.rows });
    } catch (error) {
        next(error);
    }
};

const upsertProductPricing = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { periodTypeId, price, isActive } = req.body;

        if (!periodTypeId || price === undefined) {
            return res.status(400).json({ error: 'periodTypeId and price are required' });
        }

        const result = await db.query(productQueries.upsertProductPricing, [
            id, periodTypeId, price, isActive !== false
        ]);

        res.json({
            message: 'Pricing updated successfully',
            pricing: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const deleteProductPricing = async (req, res, next) => {
    try {
        const { id, pricingId } = req.params;
        const result = await db.query(productQueries.deleteProductPricing, [pricingId, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Pricing not found' });
        }

        res.json({ message: 'Pricing deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// ============ Variants ============

const getProductVariants = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(productQueries.getProductVariants, [id]);

        // Get attribute values for each variant
        for (const variant of result.rows) {
            const attrResult = await db.query(productQueries.getVariantAttributeValues, [variant.id]);
            variant.attributeValues = attrResult.rows;
        }

        res.json({ variants: result.rows });
    } catch (error) {
        next(error);
    }
};

const createVariant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { sku, priceOverride, qtyOnHand, isActive, attributeValueIds } = req.body;

        if (!sku) {
            return res.status(400).json({ error: 'SKU is required' });
        }

        const result = await db.query(productQueries.createVariant, [
            id, sku, priceOverride || null, qtyOnHand || 0, isActive !== false
        ]);

        const variant = result.rows[0];

        // Add attribute values
        if (attributeValueIds && attributeValueIds.length > 0) {
            for (const attrValueId of attributeValueIds) {
                await db.query(productQueries.addVariantAttributeValue, [variant.id, attrValueId]);
            }
        }

        res.status(201).json({
            message: 'Variant created successfully',
            variant
        });
    } catch (error) {
        next(error);
    }
};

const updateVariant = async (req, res, next) => {
    try {
        const { id, variantId } = req.params;
        const { sku, priceOverride, qtyOnHand, isActive } = req.body;

        const result = await db.query(productQueries.updateVariant, [
            variantId, id, sku, priceOverride, qtyOnHand, isActive
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Variant not found' });
        }

        res.json({
            message: 'Variant updated successfully',
            variant: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const deleteVariant = async (req, res, next) => {
    try {
        const { id, variantId } = req.params;
        const result = await db.query(productQueries.deleteVariant, [variantId, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Variant not found' });
        }

        res.json({ message: 'Variant deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// ============ Attribute Mapping ============

const getProductAttributeMap = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await db.query(productQueries.getProductAttributes, [id]);
        res.json({ attributes: result.rows });
    } catch (error) {
        next(error);
    }
};

const mapAttributeToProduct = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { attributeId } = req.body;

        if (!attributeId) {
            return res.status(400).json({ error: 'attributeId is required' });
        }

        const result = await db.query(productQueries.mapAttributeToProduct, [id, attributeId]);

        res.json({
            message: 'Attribute mapped to product',
            mapping: result.rows[0]
        });
    } catch (error) {
        next(error);
    }
};

const removeProductAttribute = async (req, res, next) => {
    try {
        const { id, attributeId } = req.params;
        const result = await db.query(productQueries.removeProductAttribute, [id, attributeId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Attribute mapping not found' });
        }

        res.json({ message: 'Attribute removed from product' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listProducts,
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    togglePublish,
    getProductPricing,
    upsertProductPricing,
    deleteProductPricing,
    getProductVariants,
    createVariant,
    updateVariant,
    deleteVariant,
    getProductAttributeMap,
    mapAttributeToProduct,
    removeProductAttribute
};
