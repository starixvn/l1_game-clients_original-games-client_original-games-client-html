import React from 'react';
import { TabNavigationProps } from '../../../../shared/types';

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
    return (
        <div className="tab-ui-mobile">
            <div
                className={activeTab === 'Manual' ? "manual" : "auto"}
                onClick={() => onTabChange('Manual')}
                role="button"
                tabIndex={0}
            >
                <span className="tab-ui-mobile-e0">Manual</span>
            </div>
            <div
                className={activeTab === 'Auto' ? "manual" : "auto"}
                onClick={() => onTabChange('Auto')}
                role="button"
                tabIndex={0}
            >
                <span className="tab-ui-mobile-e1">Auto</span>
            </div>
        </div>
    );
};

export default TabNavigation;


