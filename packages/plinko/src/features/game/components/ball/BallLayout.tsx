import React, { forwardRef } from 'react';
import { BallLayoutProps } from '../../../../shared/types';
import LayeredCanvasBallLayout, { LayeredCanvasBallLayoutRef } from './LayeredCanvasBallLayout';

// BallLayout now uses the new layered architecture for better separation of concerns
const BallLayout = forwardRef<LayeredCanvasBallLayoutRef, BallLayoutProps>(
    ({ rows, ballsPerRow, multipliers = [], probabilities = [], betAmount = 100, onBallHit }, ref) => {
        return (
            <LayeredCanvasBallLayout
                ref={ref}
                rows={rows}
                ballsPerRow={ballsPerRow}
                multipliers={multipliers}
                probabilities={probabilities}
                betAmount={betAmount}
                onBallHit={onBallHit}
            />
        );
    }
);

BallLayout.displayName = 'BallLayout';

export type { LayeredCanvasBallLayoutRef };
export default BallLayout;


