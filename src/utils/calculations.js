/**
 * Financial calculation utilities
 */

/**
 * Calculate total from an array of items with a specific property
 * @param {Array} items - Array of items
 * @param {string} property - Property name to sum
 * @returns {number} Total sum
 */
export function calculateTotal(items, property) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((sum, item) => sum + (item[property] || 0), 0);
}

/**
 * Calculate gross profit (Laba Kotor)
 * @param {number} revenue - Total revenue
 * @param {number} cogs - Cost of Goods Sold (HPP)
 * @returns {number} Gross profit
 */
export function calculateGrossProfit(revenue, cogs) {
    return (revenue || 0) - (cogs || 0);
}

/**
 * Calculate net profit (Laba Bersih)
 * @param {number} grossProfit - Gross profit
 * @param {number} operatingExpenses - Operating expenses
 * @param {number} otherIncome - Other income
 * @param {number} otherExpenses - Other expenses
 * @returns {number} Net profit
 */
export function calculateNetProfit(grossProfit, operatingExpenses, otherIncome, otherExpenses) {
    return (grossProfit || 0) - (operatingExpenses || 0) + (otherIncome || 0) - (otherExpenses || 0);
}

/**
 * Calculate PPh Final (0.5% of revenue)
 * @param {number} revenue - Revenue amount
 * @param {number} rate - Tax rate (default 0.5%)
 * @returns {number} PPh Final amount
 */
export function calculatePphFinal(revenue, rate = 0.005) {
    return Math.round((revenue || 0) * rate);
}

/**
 * Check if balance sheet is balanced
 * @param {number} totalAssets - Total assets (Aktiva)
 * @param {number} totalLiabilities - Total liabilities (Kewajiban)
 * @param {number} totalEquity - Total equity (Modal)
 * @param {number} tolerance - Tolerance for rounding errors
 * @returns {boolean} True if balanced
 */
export function isBalanceSheetBalanced(totalAssets, totalLiabilities, totalEquity, tolerance = 1) {
    const difference = Math.abs(totalAssets - (totalLiabilities + totalEquity));
    return difference <= tolerance;
}

/**
 * Get balance sheet difference
 * @param {number} totalAssets - Total assets
 * @param {number} totalLiabilities - Total liabilities
 * @param {number} totalEquity - Total equity
 * @returns {number} Difference (should be 0 if balanced)
 */
export function getBalanceDifference(totalAssets, totalLiabilities, totalEquity) {
    return totalAssets - (totalLiabilities + totalEquity);
}
