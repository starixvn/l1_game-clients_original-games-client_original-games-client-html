// Centralized bet configuration constants - must match service configuration
export const BET_CONFIG = {
    MIN_BET: 1,
    MAX_BET: 3000,
    DEFAULT_BET: 100,
    DECIMAL_PLACES: 2,
} as const;

// Validation helpers
export const validateBetAmount = (amount: number): number => {
    let validatedAmount = amount;

    // Round to specified decimal places
    validatedAmount = Math.round(validatedAmount * Math.pow(10, BET_CONFIG.DECIMAL_PLACES)) / Math.pow(10, BET_CONFIG.DECIMAL_PLACES);

    // Apply min/max bounds
    if (validatedAmount < BET_CONFIG.MIN_BET) {
        return BET_CONFIG.MIN_BET;
    }
    if (validatedAmount > BET_CONFIG.MAX_BET) {
        return BET_CONFIG.MAX_BET;
    }

    return validatedAmount;
};

// Formatting helpers
export const formatBetAmount = (amount: number): string => {
    return amount.toLocaleString('en-US', {
        minimumFractionDigits: BET_CONFIG.DECIMAL_PLACES,
        maximumFractionDigits: BET_CONFIG.DECIMAL_PLACES,
    });
};

export const parseBetAmount = (input: string): number | null => {
    // Remove commas and parse
    const cleanInput = input.replace(/,/g, '');
    const parsed = parseFloat(cleanInput);

    if (isNaN(parsed) || parsed < 0) {
        return null;
    }

    return parsed;
};
