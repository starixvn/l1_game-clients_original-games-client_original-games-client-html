import React from 'react';
import { BetsTableHeaderProps } from '../../../../shared/types';

const BetsTableHeader: React.FC<BetsTableHeaderProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="frame-f0">
            <div
                className={`$tab-ui-mobile-f1 ${activeTab === 'All' ? "active" : ''}`}
                onClick={() => onTabChange('All')}
                role="button"
                tabIndex={0}
            >
                <span className="manual-all-bets">All Bets</span>
            </div>
            <div
                className={`$tab-ui-mobile-f2 ${activeTab === 'My' ? "active" : ''}`}
                onClick={() => onTabChange('My')}
                role="button"
                tabIndex={0}
            >
                <span className="auto-my-bets">My Bets</span>
            </div>
            <div
                className={`$tab-ui-mobile-f3 ${activeTab === 'HighRoller' ? "active" : ''}`}
                onClick={() => onTabChange('HighRoller')}
                role="button"
                tabIndex={0}
            >
                <span className="auto-high-roller">High Roller</span>
            </div>
        </div>
    );
};

export default BetsTableHeader;


