const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');
const { paginate, paginationResponse } = require('../utils/helpers');

const catalogQueries = loadQueries('catalog.sql');
const productQueries = loadQueries('products.sql');

/**
 * GET /api/catalog/products
 * Browse published products
 */
const listProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search || '';
        const { limit: queryLimit, offset } = paginate(page, limit);

        let productsResult, countResult;

        if (search) {
            [productsResult, countResult] = await Promise.all([
                db.query(catalogQueries.searchProducts, [search, queryLimit, offset]),
                db.query(catalogQueries.countSearchProducts, [search])
            ]);
        } else {
            [productsResult, countResult] = await Promise.all([
                db.query(catalogQueries.listPublishedProducts, [queryLimit, offset]),
                db.query(catalogQueries.countPublishedProducts)
            ]);
        }

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
 * GET /api/catalog/products/:id
 * Get product details
 */
const getProduct = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await db.query(catalogQueries.getPublishedProductById, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        const product = result.rows[0];

        // Get pricing and variants
        const [pricingResult, variantsResult, attributesResult] = await Promise.all([
            db.query(catalogQueries.getProductPricingPublic, [id]),
            db.query(catalogQueries.getProductVariantsPublic, [id]),
            db.query(productQueries.getProductAttributes, [id])
        ]);

        // Get attribute values for each variant
        for (const variant of variantsResult.rows) {
            const attrResult = await db.query(productQueries.getVariantAttributeValues, [variant.id]);
            variant.attributeValues = attrResult.rows;
        }

        res.json({
            product,
            pricing: pricingResult.rows,
            variants: variantsResult.rows,
            attributes: attributesResult.rows
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/catalog/products/:id/availability
 * Check product availability for given dates
 */
const checkAvailability = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { variantId, startDate, endDate, quantity } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
        }

        const requestedQty = parseInt(quantity) || 1;

        // Check product exists and is published
        const productResult = await db.query(catalogQueries.getPublishedProductById, [id]);
        if (productResult.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check availability
        const availResult = await db.query(catalogQueries.checkProductAvailability, [
            id,
            variantId || null,
            variantId || null,
            startDate,
            endDate
        ]);

        const totalQty = parseInt(availResult.rows[0].total_qty) || productResult.rows[0].qty_on_hand;
        const reservedQty = parseInt(availResult.rows[0].reserved_qty) || 0;
        const availableQty = totalQty - reservedQty;

        const isAvailable = availableQty >= requestedQty;

        res.json({
            productId: id,
            variantId: variantId || null,
            startDate,
            endDate,
            requestedQuantity: requestedQty,
            totalQuantity: totalQty,
            reservedQuantity: reservedQty,
            availableQuantity: availableQty,
            isAvailable
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    listProducts,
    getProduct,
    checkAvailability
};
