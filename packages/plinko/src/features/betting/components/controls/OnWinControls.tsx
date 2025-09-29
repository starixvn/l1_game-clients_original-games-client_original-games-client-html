import React from 'react';
import { OnWinControlsProps } from '../../../../shared/types';
import PercentageControl from './PercentageControl';

const OnWinControls: React.FC<OnWinControlsProps> = ({
    onWinAction,
    onWinPercentage,
    onWinActionChange,
    onWinPercentageChange,
}) => {
    return (
        <PercentageControl
            title="On Win"
            action={onWinAction}
            percentage={onWinPercentage}
            onActionChange={onWinActionChange}
            onPercentageChange={onWinPercentageChange}
            containerClassName="container-bd"
            titleClassName="title-be"
        />
    );
};

export default OnWinControls;


