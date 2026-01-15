/**
 * Currency formatting utilities for Indonesian Rupiah
 */

/**
 * Format a number to Indonesian Rupiah format
 * @param {number} value - The number to format
 * @param {boolean} withSymbol - Whether to include "Rp" symbol
 * @returns {string} Formatted currency string
 */
export function formatRupiah(value, withSymbol = true) {
    if (value === null || value === undefined || isNaN(value)) {
        return withSymbol ? 'Rp 0' : '0';
    }

    const absValue = Math.abs(value);
    const formatted = absValue
        .toFixed(0)
        .replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    const prefix = value < 0 ? '-' : '';
    return withSymbol ? `${prefix}Rp ${formatted}` : `${prefix}${formatted}`;
}

/**
 * Parse a Rupiah string back to a number
 * @param {string} value - The Rupiah string to parse
 * @returns {number} Parsed number
 */
export function parseRupiah(value) {
    if (!value) return 0;

    // Remove "Rp", spaces, and dots
    const cleaned = value
        .toString()
        .replace(/Rp\s?/gi, '')
        .replace(/\./g, '')
        .replace(/,/g, '')
        .trim();

    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format number with thousand separators (without Rp symbol)
 * @param {number} value - The number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0';
    }

    return value.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Parse a formatted number string back to a number
 * @param {string} value - The formatted string to parse
 * @returns {number} Parsed number
 */
export function parseNumber(value) {
    if (!value) return 0;

    const cleaned = value.toString().replace(/\./g, '').trim();
    const parsed = parseInt(cleaned, 10);
    return isNaN(parsed) ? 0 : parsed;
}
