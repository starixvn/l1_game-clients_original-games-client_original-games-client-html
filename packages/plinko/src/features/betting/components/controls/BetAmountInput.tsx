import React, { useState, useEffect } from 'react';
import { BetAmountControlsProps } from '../../../../shared/types';
import styles from './BetAmountInput.module.scss';
import { BET_CONFIG, validateBetAmount, formatBetAmount, parseBetAmount } from './bet-config';
import { logger } from '../../../../services';

interface BetAmountInputProps extends BetAmountControlsProps {
    // Additional props for error display
    showError?: boolean;
    errorMessage?: string;
}

const BetAmountInput: React.FC<BetAmountInputProps> = ({
    betAmount,
    onBetAmountChange,
    showError = false,
    errorMessage = '',
}) => {
    const [inputValue, setInputValue] = useState<string>(formatBetAmount(betAmount));
    const [error, setError] = useState<string>('');

    // Update input value when betAmount prop changes
    useEffect(() => {
        setInputValue(formatBetAmount(betAmount));
    }, [betAmount]);

    // Validate and format bet amount on blur
    const validateAndCorrectBetAmount = (value: string): number => {
        const parsed = parseBetAmount(value);

        // If invalid input, set to min bet
        if (parsed === null || value.trim() === '') {
            setError(`Bet adjusted to minimum amount ($${BET_CONFIG.MIN_BET})`);
            return BET_CONFIG.MIN_BET;
        }

        // Validate and apply bounds
        const validatedAmount = validateBetAmount(parsed);

        // Set error message if amount was adjusted
        if (validatedAmount !== parsed) {
            if (parsed < BET_CONFIG.MIN_BET) {
                setError(`Bet adjusted to minimum amount ($${BET_CONFIG.MIN_BET})`);
            } else if (parsed > BET_CONFIG.MAX_BET) {
                setError(`Bet adjusted to maximum amount ($${BET_CONFIG.MAX_BET})`);
            }
        } else {
            setError('');
        }

        return validatedAmount;
    };

    // Handle input change - allow only numeric input and decimal point
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Allow empty string, numbers, and single decimal point
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setInputValue(value);
        }
    };

    // Handle blur event - validate and auto-correct
    const handleBlur = () => {
        const correctedAmount = validateAndCorrectBetAmount(inputValue);
        setInputValue(formatBetAmount(correctedAmount));
        onBetAmountChange(correctedAmount);

        // Clear error after 3 seconds if there was one
        if (error) {
            setTimeout(() => setError(''), 3000);
        }
    };

    // Handle key press - prevent non-numeric input
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Allow control keys (backspace, delete, arrows, etc.)
        if (e.ctrlKey || e.altKey || e.metaKey) return;

        // Allow numbers, decimal point, and navigation keys
        const allowedKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', 'Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

        if (!allowedKeys.includes(e.key)) {
            e.preventDefault();
        }

        // Prevent multiple decimal points
        if (e.key === '.' && inputValue.includes('.')) {
            e.preventDefault();
        }
    };

    return (
        <div
            className={styles.betAmountInput}
        >
            <div className={styles.title}>
                <div className={styles.spanTitle}>
                    <span className={styles.spanRoundId}>Bet Amount</span>
                    <span className={styles.input}>#123456</span>
                </div>
                <div className={styles.inputContainer}>
                    <input
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        onKeyPress={handleKeyPress}
                        className={styles.betInput}
                        placeholder="Enter bet amount"
                        aria-label="Bet amount input"
                        maxLength={10}
                    />
                    <div className={styles.controlButtons}>
                        <div
                            className={styles.spanNumber}
                            onClick={() => onBetAmountChange(Math.max(BET_CONFIG.MIN_BET, betAmount / 2))}
                            role="button"
                            tabIndex={0}
                        >
                            <span className={styles.divContainerA6}>1/2</span>
                        </div>
                        <div
                            className={styles.spanNumberA7}
                            onClick={() => onBetAmountChange(Math.min(BET_CONFIG.MAX_BET, betAmount * 2))}
                            role="button"
                            tabIndex={0}
                        >
                            <span className={styles.divContainerA8}>2x</span>
                        </div>
                        <div
                            className={styles.spanNumberA9}
                            onClick={() => onBetAmountChange(BET_CONFIG.MAX_BET)}
                            role="button"
                            tabIndex={0}
                        >
                            <span className={styles.divContainerAa}>Max</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error message display */}
            {(error || (showError && errorMessage)) && (
                <div className={styles.errorMessage} role="alert" aria-live="polite">
                    {error || errorMessage}
                </div>
            )}
        </div>
    );
};

export default BetAmountInput;
