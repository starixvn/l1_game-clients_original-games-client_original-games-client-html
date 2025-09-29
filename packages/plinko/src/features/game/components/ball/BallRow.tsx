import React from 'react';
import { BallRowProps } from '../../../../shared/types';
import Ball from './Ball';

const BallRow: React.FC<BallRowProps> = ({ balls, rowClass }) => {
    return (
        <div className={rowClass}>
            {balls.map((ball, index) => (
                <Ball
                    key={`ball-${index}`}
                    sizeClass={ball.sizeClass}
                    typeClass={ball.typeClass}
                />
            ))}
        </div>
    );
};

export default BallRow;


