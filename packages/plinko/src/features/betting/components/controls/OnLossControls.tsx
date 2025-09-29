import React from 'react';
import { OnLossControlsProps } from '../../../../shared/types';
import PercentageControl from './PercentageControl';

const OnLossControls: React.FC<OnLossControlsProps> = ({
    onLossAction,
    onLossPercentage,
    onLossActionChange,
    onLossPercentageChange,
}) => {
    return (
        <PercentageControl
            title="On Loss"
            action={onLossAction}
            percentage={onLossPercentage}
            onActionChange={onLossActionChange}
            onPercentageChange={onLossPercentageChange}
            containerClassName="title-c8"
            titleClassName="frame-c9"
        />
    );
};

export default OnLossControls;
