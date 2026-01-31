/**
 * Validation helper functions
 */

const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validateGSTIN = (gstin) => {
    // GSTIN format: 22AAAAA0000A1Z5 (15 characters)
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
};

const validatePassword = (password) => {
    // At least 8 characters
    return password && password.length >= 8;
};

const validateRequired = (fields, body) => {
    const missing = [];
    for (const field of fields) {
        if (body[field] === undefined || body[field] === null || body[field] === '') {
            missing.push(field);
        }
    }
    return missing;
};

const validateDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

const validateDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end;
};

const validatePositiveNumber = (value) => {
    const num = Number(value);
    return !isNaN(num) && num > 0;
};

const validateNonNegativeNumber = (value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0;
};

const validateInteger = (value) => {
    return Number.isInteger(Number(value));
};

const sanitizeString = (str) => {
    if (typeof str !== 'string') return str;
    return str.trim();
};

module.exports = {
    validateEmail,
    validateGSTIN,
    validatePassword,
    validateRequired,
    validateDate,
    validateDateRange,
    validatePositiveNumber,
    validateNonNegativeNumber,
    validateInteger,
    sanitizeString
};
