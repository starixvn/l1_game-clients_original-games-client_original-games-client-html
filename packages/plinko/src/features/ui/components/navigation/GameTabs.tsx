import React from 'react';
import { GameTabsProps } from '../../../../shared/types';
import { TabNavigation, IconControls } from '../index';

const GameTabs: React.FC<GameTabsProps> = ({
    activeTab,
    onTabChange,
    soundEnabled,
    onSoundToggle,
}) => {
    return (
        <div className="tab-ui">
            <TabNavigation
                activeTab={activeTab}
                onTabChange={onTabChange}
            />
            <IconControls
                soundEnabled={soundEnabled}
                onSoundToggle={onSoundToggle}
            />
        </div>
    );
};

export default GameTabs;


