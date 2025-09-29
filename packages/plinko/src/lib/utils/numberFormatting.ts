/**
 * Shared utility functions for number formatting across components
 */

/**
 * Format a number with commas and 2 decimal places
 * @param value - The number to format
 * @returns Formatted string with commas and 2 decimal places
 */
export const formatNumberWithCommas = (value: number): string => {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

/**
 * Format input value with commas during typing
 * @param value - The input string value
 * @returns Formatted string with commas
 */
export const formatInputWithCommas = (value: string): string => {
    if (value === '' || value === '.') return value;

    // Split by decimal point
    const parts = value.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '';

    // Format integer part with commas
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Return formatted value
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

/**
 * Validate and format percentage input
 * @param input - Raw input string
 * @param currentValue - Current valid value for fallback
 * @param onChange - Callback to update the value
 * @param maxValue - Maximum allowed value (default: 10000)
 */
export const validatePercentageInput = (
    input: string,
    currentValue: number,
    onChange: (value: number) => void,
    maxValue: number = 10000
): string => {
    // Allow empty input temporarily
    if (input === '') {
        return '';
    }

    // Remove commas and allow numbers and decimal point
    const cleanValue = input.replace(/,/g, '').replace(/[^0-9.]/g, '');

    // Parse as float to allow decimals
    const numValue = parseFloat(cleanValue);

    // Validate range: min 0, max maxValue
    if (isNaN(numValue) || numValue < 0) {
        return formatNumberWithCommas(currentValue);
    }

    if (numValue > maxValue) {
        const cappedValue = maxValue;
        onChange(cappedValue);
        return formatNumberWithCommas(cappedValue);
    }

    // Validate decimal places (max 2)
    const decimalPart = cleanValue.split('.')[1];
    if (decimalPart && decimalPart.length > 2) {
        // Round to 2 decimal places
        const roundedValue = Math.round(numValue * 100) / 100;
        onChange(roundedValue);
        return formatNumberWithCommas(roundedValue);
    }

    // Valid value - format with commas
    onChange(numValue);
    return formatNumberWithCommas(numValue);
};

/**
 * Handle input change for percentage fields with validation
 * @param value - Input value
 * @returns Filtered and formatted value
 */
export const handlePercentageInputChange = (value: string): string => {
    // Only allow numeric characters and decimal point
    const filteredValue = value.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = filteredValue.split('.');
    const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : filteredValue;

    // Apply comma formatting immediately
    return formatInputWithCommas(cleanValue);
};
