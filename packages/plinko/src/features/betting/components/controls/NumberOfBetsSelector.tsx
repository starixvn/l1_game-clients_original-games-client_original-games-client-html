import React, { useState, useEffect } from 'react';
import { NumberOfBetsSelectorProps } from '../../../../shared/types';
import Styles from './NumberOfBetsSelector.module.scss';

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

const NumberOfBetsSelector: React.FC<NumberOfBetsSelectorProps> = ({
    numberOfBets,
    onNumberOfBetsChange,
}) => {
    const [inputValue, setInputValue] = useState<string>(
        numberOfBets === Infinity ? '' : formatNumberWithCommas(numberOfBets)
    );

    // Update input value when numberOfBets prop changes
    useEffect(() => {
        setInputValue(numberOfBets === Infinity ? '' : formatNumberWithCommas(numberOfBets));
    }, [numberOfBets]);

    const numberOfBetsOptions = ['20000', '∞', '10', '100'];

    const getContainerClass = (index: number) => {
        switch (index) {
            case 0: return "container-b7";
            case 1: return "container-b9";
            case 2: return "container-bb";
            case 3: return "container-bb";
            default: return "container-b7";
        }
    };

    const getSpanClass = (index: number) => {
        switch (index) {
            case 0: return "span-b8";
            case 1: return "span-ba";
            case 2: return "span-bc";
            case 3: return "span-bc";
            default: return "span-b8";
        }
    };

    // Section 4.6.1: Validation for Number of Bets input
    const validateAndUpdateBets = (value: string) => {
        // Allow empty input temporarily
        if (value === '') {
            setInputValue('');
            return;
        }

        // Remove commas and allow numbers and decimal point
        const cleanValue = value.replace(/,/g, '').replace(/[^0-9.]/g, '');

        // Parse as float to allow decimals
        const numValue = parseFloat(cleanValue);

        // Validate decimal places (max 2)
        const decimalPart = cleanValue.split('.')[1];
        if (decimalPart && decimalPart.length > 2) {
            // Round to 2 decimal places
            const roundedValue = Math.round(numValue * 100) / 100;
            setInputValue(formatNumberWithCommas(roundedValue));
            onNumberOfBetsChange(Math.floor(roundedValue)); // Convert to integer for bets
            return;
        }

        // Convert to integer for number of bets
        const intValue = Math.floor(numValue);

        // Validate range: min 1, max 999999999
        if (isNaN(numValue) || numValue < 1) {
            // If invalid, keep the current valid value
            setInputValue(numberOfBets === Infinity ? '' : formatNumberWithCommas(numberOfBets));
            return;
        }

        if (intValue > 999999999) {
            // Cap at maximum allowed value
            const cappedValue = 999999999;
            setInputValue(formatNumberWithCommas(cappedValue));
            onNumberOfBetsChange(cappedValue);
            return;
        }

        // Valid value - format with commas, store as integer
        setInputValue(formatNumberWithCommas(numValue));
        onNumberOfBetsChange(intValue);
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
        validateAndUpdateBets(inputValue);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    const handlePresetClick = (option: string) => {
        const value = option === '∞' ? Infinity : parseInt(option);
        onNumberOfBetsChange(value);
    };

    // Display value for input (handle infinity case)
    const displayValue = numberOfBets === Infinity ? '' : inputValue;

    return (
        <div
            className="div-number-of-bets"
            ref={(el) => {
                if (el) {
                    console.log('NumberOfBetsSelector INTERNAL CONTAINER:', el.offsetWidth, 'x', el.offsetHeight);
                    console.log('NumberOfBetsSelector INTERNAL computed styles:', window.getComputedStyle(el));
                }
            }}
        >
            <span className="span-title-b4">Number of Bets</span>
            <div className="input-b5">
                <div className="frame-b6">
                    <input
                        type="text"
                        className={Styles.inputField}
                        value={displayValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        onKeyDown={handleInputKeyDown}
                        placeholder={numberOfBets === Infinity ? '∞' : ''}
                        maxLength={9} // Max 9 digits for 999999999
                    />
                </div>
                <div className="container">
                    {numberOfBetsOptions.map((option, index) => (
                        <div
                            key={`bets-option-${option}`}
                            className={getContainerClass(index)}
                            onClick={() => handlePresetClick(option)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handlePresetClick(option);
                                }
                            }}
                        >
                            <span className={getSpanClass(index)}>{option}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NumberOfBetsSelector;


