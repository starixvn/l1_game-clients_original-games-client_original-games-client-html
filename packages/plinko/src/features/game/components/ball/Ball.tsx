import React from 'react';
import { BallProps } from '../../../../shared/types';

const Ball: React.FC<BallProps> = ({ sizeClass, typeClass, multiplier, payoutClass }) => {
    return (
        <div className={`${sizeClass} ${payoutClass || ''}`.trim()}>
            <div className={typeClass} />
            {multiplier && multiplier !== 1 && (
                <div className="ball-multiplier">
                    {multiplier.toFixed(1)}x
                </div>
            )}
        </div>
    );
};

export default Ball;


