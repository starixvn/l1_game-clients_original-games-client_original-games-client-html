import React, { useState, useEffect } from 'react';
import { formatNumberWithCommas, validatePercentageInput, handlePercentageInputChange } from '../../../../lib/utils/numberFormatting';
import styles from './PercentageControl.module.scss';

export interface PercentageControlProps {
    title: string;
    action: 'Reset' | 'Increase';
    percentage: number;
    onActionChange: (action: 'Reset' | 'Increase') => void;
    onPercentageChange: (percentage: number) => void;
    containerClassName?: string;
    titleClassName?: string;
}

const PercentageControl: React.FC<PercentageControlProps> = ({
    title,
    action,
    percentage,
    onActionChange,
    onPercentageChange,
    containerClassName = '',
    titleClassName = ''
}) => {
    const [inputValue, setInputValue] = useState<string>(formatNumberWithCommas(percentage));

    // Update input value when percentage prop changes
    useEffect(() => {
        setInputValue(formatNumberWithCommas(percentage));
    }, [percentage]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const formattedValue = handlePercentageInputChange(value);
        setInputValue(formattedValue);
    };

    const handleInputBlur = () => {
        const validatedValue = validatePercentageInput(inputValue, percentage, onPercentageChange);
        setInputValue(validatedValue);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
        }
    };

    const getButtonClass = (buttonAction: string, isSelected: boolean) => {
        const baseClass = buttonAction === 'Reset' ? styles['reset-button'] : styles['increase-button'];
        return isSelected ? `${baseClass} ${styles.selected}` : baseClass;
    };

    return (
        <div className={`${styles.container} ${containerClassName}`}>
            <span className={`${styles.title} ${titleClassName}`}>{title}</span>
            <div className={styles['input-field']}>
                <div className={styles['frame-ca']}>
                    <div className={styles['frame-cb']}>
                        <button
                            type="button"
                            className={getButtonClass('Reset', action === 'Reset')}
                            onClick={() => onActionChange('Reset')}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onActionChange('Reset');
                                }
                            }}
                            aria-pressed={action === 'Reset'}
                        >
                            <span className={styles['button-text']}>Reset</span>
                        </button>
                        <button
                            type="button"
                            className={getButtonClass('Increase', action === 'Increase')}
                            onClick={() => onActionChange('Increase')}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    onActionChange('Increase');
                                }
                            }}
                            aria-pressed={action === 'Increase'}
                        >
                            <span className={styles['button-text']}>Increase by</span>
                        </button>
                    </div>
                </div>
                <div className={styles['frame-d0']}>
                    <div className={styles['span-d1']}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            onBlur={handleInputBlur}
                            onKeyDown={handleInputKeyDown}
                            disabled={action === 'Reset'}
                            className={`${styles['percentage-input']} ${action === 'Reset' ? styles.disabled : ''}`}
                            maxLength={5}
                        />
                    </div>
                    <div className={styles['percentage-d3']}>
                        <span className={styles['title-d4']}>%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PercentageControl;
