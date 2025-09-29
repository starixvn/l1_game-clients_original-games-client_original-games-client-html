import React, { useState, useEffect } from 'react';
import { StopOnWinControlsProps } from '../../../../shared/types';
import Styles from './StopOnWinControls.module.scss';

// Utility function to format number with commas
const formatNumberWithCommas = (value: number): string => {
    return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Utility function to format input value with commas during typing
const formatInputWithCommas = (value: string): string => {
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

const StopOnWinControls: React.FC<StopOnWinControlsProps> = ({
    stopOnWin,
    onStopOnWinChange,
}) => {
    const [inputValue, setInputValue] = useState<string>(formatNumberWithCommas(stopOnWin));

    // Update input value when stopOnWin prop changes
    useEffect(() => {
        setInputValue(formatNumberWithCommas(stopOnWin));
    }, [stopOnWin]);

    // Section 4.6.1: Validate Stop on Win input
    const validateAndUpdateStopOnWin = (value: string) => {
        // Allow empty input temporarily
        if (value === '') {
            setInputValue('');
            return;
        }

        // Remove commas and parse as float to allow decimals
        const cleanValue = value.replace(/,/g, '');
        const numValue = parseFloat(cleanValue);

        // Validate range: min 0
        if (isNaN(numValue) || numValue < 0) {
            // If invalid, keep the current valid value
            setInputValue(formatNumberWithCommas(stopOnWin));
            return;
        }

        // Validate decimal places (max 2)
        const decimalPart = value.split('.')[1];
        if (decimalPart && decimalPart.length > 2) {
            // Round to 2 decimal places
            const roundedValue = Math.round(numValue * 100) / 100;
            setInputValue(formatNumberWithCommas(roundedValue));
            onStopOnWinChange(roundedValue);
            return;
        }

        // Validate max length (22 characters as per spec)
        if (value.length > 22) {
            // Cap at max length, keep current value
            setInputValue(formatNumberWithCommas(stopOnWin));
            return;
        }

        // Valid value - format with commas
        setInputValue(formatNumberWithCommas(numValue));
        onStopOnWinChange(numValue);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Only allow numeric characters and decimal point
        const filteredValue = value.replace(/[^0-9.]/g, '');
        // Prevent multiple decimal points
        const parts = filteredValue.split('.');
        const cleanValue = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : filteredValue;
        // Apply comma formatting immediately
        const formattedValue = formatInputWithCommas(cleanValue);
        setInputValue(formattedValue);
    };

    const handleInputBlur = () => {
        // Validate on blur
        validateAndUpdateStopOnWin(inputValue);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    return (
        <div className="frame-d5">
            <span className="input-d6">Stop On Win</span>
            <div className="frame-d7">
                <div className="input-d8">
                    <div className="frame-d9">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            onKeyDown={handleInputKeyDown}
                            className={Styles.stopInput}
                            placeholder="0.00"
                            maxLength={22}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StopOnWinControls;


