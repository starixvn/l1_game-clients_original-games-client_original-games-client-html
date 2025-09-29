import React from 'react';
import { RowsSelectorProps } from '../../../../shared/types';
import { logger } from '../../../../services';

const RowsSelector: React.FC<RowsSelectorProps> = ({
    rows,
    onRowsChange,
    disabled = false,
}) => {
    // Section 4.2: Rows selection from 8 to 16

    const handleRowsChange = (newRows: number) => {
        if (!disabled && newRows >= 8 && newRows <= 16) {
            onRowsChange(newRows);
        }
    };

    return (
        <div
            className={`div-setting-row ${disabled ? 'disabled' : ''}`}
            ref={(el) => {
                if (el) {
                    const styles = window.getComputedStyle(el);
                    logger.info('RowsSelector main container computed styles', {
                        width: styles.width,
                        height: styles.height,
                        position: styles.position,
                        display: styles.display,
                        padding: styles.padding,
                        margin: styles.margin,
                        border: styles.border,
                        className: el.className
                    });
                }
            }}
        >
            <span className="span-title-b1">Rows</span>
            <div className="div-setting-row-b2">
                <div className="div-number">
                    <span className="span-number-b3">{rows}</span>
                </div>
                <input
                    type="range"
                    min="8"
                    max="16"
                    value={rows}
                    onChange={(e) => handleRowsChange(parseInt(e.target.value, 10))}
                    disabled={disabled}
                    className="rows-slider"
                    aria-label="Select number of rows"
                />
            </div>

            <style jsx>{`
                .div-setting-row.disabled {
                    opacity: 0.5;
                }

                .rows-slider {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 100%;
                    height: 6px;
                    border-radius: 3px;
                    background: #2a466f;
                    outline: none;
                    border: 1px solid #3a567f;
                    transition: all 0.2s ease;
                    cursor: pointer;
                }

                .rows-slider:hover:not(:disabled) {
                    background: #1d9c05;
                    border-color: #1fdc13;
                }

                .rows-slider:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px rgba(29, 220, 19, 0.3);
                }

                .rows-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #1fdc13;
                    border: 2px solid #2ee620;
                    cursor: pointer;
                    box-shadow: 0 0 6px rgba(29, 220, 19, 0.4);
                    transition: all 0.2s ease;
                }

                .rows-slider::-webkit-slider-thumb:hover {
                    background: #2ee620;
                    border-color: #3ff630;
                    box-shadow: 0 0 10px rgba(29, 220, 19, 0.6);
                    transform: scale(1.15);
                }

                .rows-slider::-webkit-slider-thumb:active {
                    transform: scale(1.25);
                    box-shadow: 0 0 12px rgba(29, 220, 19, 0.8);
                }

                .rows-slider::-webkit-slider-track {
                    background: #2a466f;
                    height: 6px;
                    border-radius: 3px;
                    border: 1px solid #3a567f;
                }

                .rows-slider::-moz-range-thumb {
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #1fdc13;
                    border: 2px solid #2ee620;
                    cursor: pointer;
                    box-shadow: 0 0 6px rgba(29, 220, 19, 0.4);
                    transition: all 0.2s ease;
                }

                .rows-slider::-moz-range-thumb:hover {
                    background: #2ee620;
                    border-color: #3ff630;
                    box-shadow: 0 0 10px rgba(29, 220, 19, 0.6);
                }

                .rows-slider::-moz-range-thumb:active {
                    transform: scale(1.25);
                    box-shadow: 0 0 12px rgba(29, 220, 19, 0.8);
                }

                .rows-slider::-moz-range-track {
                    background: #2a466f;
                    height: 6px;
                    border-radius: 3px;
                    border: 1px solid #3a567f;
                }

                .rows-slider:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .rows-slider:disabled::-webkit-slider-thumb {
                    cursor: not-allowed;
                }

                .rows-slider:disabled::-moz-range-thumb {
                    cursor: not-allowed;
                }

                .div-setting-row-b2 {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    flex: 1;
                }
            `}</style>
        </div>
    );
};

export default RowsSelector;


