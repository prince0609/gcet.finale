const crypto = require('crypto');

/**
 * Generate a random token for password reset
 */
const generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate invoice number
 * Format: INV-YYYY-NNNNN
 */
const generateInvoiceNumber = (sequence) => {
    const year = new Date().getFullYear();
    const paddedSequence = String(sequence).padStart(5, '0');
    return `INV-${year}-${paddedSequence}`;
};

/**
 * Calculate rental days between two dates
 */
const calculateRentalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * Calculate rental price based on period type
 */
const calculateRentalPrice = (pricing, startDate, endDate) => {
    const days = calculateRentalDays(startDate, endDate);

    // Find best pricing (weekly if >= 7 days, daily otherwise, hourly if < 1 day)
    let price = 0;

    if (pricing.weekly && days >= 7) {
        const weeks = Math.ceil(days / 7);
        price = pricing.weekly * weeks;
    } else if (pricing.daily) {
        price = pricing.daily * days;
    } else if (pricing.hourly) {
        const hours = days * 24;
        price = pricing.hourly * hours;
    } else {
        // Fallback to sales price
        price = pricing.salesPrice * days;
    }

    return price;
};

/**
 * Format currency
 */
const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

/**
 * Paginate results
 */
const paginate = (page = 1, limit = 20) => {
    const offset = (page - 1) * limit;
    return { limit, offset };
};

/**
 * Build pagination response
 */
const paginationResponse = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    return {
        data,
        pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        }
    };
};

/**
 * Calculate late days
 */
const calculateLateDays = (rentalEnd, actualReturn, gracePeriod = 0) => {
    const end = new Date(rentalEnd);
    const returned = new Date(actualReturn);

    if (returned <= end) return 0;

    const diffTime = returned - end;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays - gracePeriod);
};

module.exports = {
    generateToken,
    generateInvoiceNumber,
    calculateRentalDays,
    calculateRentalPrice,
    formatCurrency,
    paginate,
    paginationResponse,
    calculateLateDays
};
