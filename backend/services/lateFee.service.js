const db = require('../config/db');
const { loadQueries } = require('../utils/queryLoader');
const { calculateLateDays } = require('../utils/helpers');

const returnQueries = loadQueries('returns.sql');

/**
 * Calculate late fee for a return
 */
const calculateLateFee = async (productId, rentalEnd, actualReturnDate, unitPrice) => {
    // Get late fee policy (product-specific or global)
    const policyResult = await db.query(returnQueries.getLateFeePolicy, [productId]);

    if (policyResult.rows.length === 0) {
        // No policy found, no late fee
        return { lateDays: 0, feeAmount: 0 };
    }

    const policy = policyResult.rows[0];
    const gracePeriod = policy.grace_period_days || 0;
    const feePerDay = parseFloat(policy.fee_per_day) || 0;
    const maxMultiplier = parseFloat(policy.max_fee_multiplier) || 2.0;

    // Calculate late days (after grace period)
    const lateDays = calculateLateDays(rentalEnd, actualReturnDate, gracePeriod);

    if (lateDays <= 0) {
        return { lateDays: 0, feeAmount: 0 };
    }

    // Calculate fee
    let feeAmount = lateDays * feePerDay;

    // Cap at max multiplier of unit price
    const maxFee = unitPrice * maxMultiplier;
    if (feeAmount > maxFee) {
        feeAmount = maxFee;
    }

    return {
        lateDays,
        feeAmount: Math.round(feeAmount * 100) / 100,
        gracePeriod,
        feePerDay,
        maxFee
    };
};

module.exports = {
    calculateLateFee
};
