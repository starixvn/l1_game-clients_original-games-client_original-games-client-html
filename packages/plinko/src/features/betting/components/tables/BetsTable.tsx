import React from 'react';
import { BetsTableProps } from '../../../../shared/types';
import { BetsTableHeader, BetsTableRow } from '../index';
import { logger } from '../../../../services';

const BetsTable: React.FC<BetsTableProps> = ({ bets, activeTab, onTabChange }) => {
    const handleStylesLog = (element: HTMLElement | null, componentName: string) => {
        if (element) {
            const styles = window.getComputedStyle(element);
            logger.info(`BetsTable ${componentName} computed styles`, {
                width: styles.width,
                height: styles.height,
                position: styles.position,
                display: styles.display,
                overflow: styles.overflow,
                className: element.className
            });
        }
    };

    // Generate table rows based on active tab
    const getFilteredBets = () => {
        // For now, return all bets. In a real implementation, you'd filter based on activeTab
        return bets;
    };

    const filteredBets = getFilteredBets();

    return (
        <div
            className="my-bets"
            ref={(el) => handleStylesLog(el, 'main container')}
        >
            <BetsTableHeader
                activeTab={activeTab}
                onTabChange={onTabChange}
            />

            {/* Table Content */}
            <div className="table">
                <div className="content-table-mobile">
                    {filteredBets.map((bet, index) => (
                        <BetsTableRow
                            key={`bet-${index}`}
                            bet={bet}
                            rowClass={getRowClass(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Helper function to get the correct CSS class for each row
const getRowClass = (index: number): string => {
    const rowClasses = [
        'row-f4',
        'content-table-f9',
        'john-smith-john-smith92',
        'content-table-105',
        'empty-10c',
        'comma-113',
        'row-11a',
        'content-table-121',
        'john-smith-john-smith92-128',
        'content-table-12f'
    ];
    return rowClasses[index] || 'row-f4';
};

export default BetsTable;


