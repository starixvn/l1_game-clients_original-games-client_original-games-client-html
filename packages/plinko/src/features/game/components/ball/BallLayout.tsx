import React, { forwardRef } from 'react';
import { BallLayoutProps } from '../../../../shared/types';
import CanvasBallLayout, { CanvasBallLayoutRef } from './CanvasBallLayout';

// BallLayout now acts as a wrapper that uses the CanvasBallLayout from ball-layout directory
const BallLayout = forwardRef<CanvasBallLayoutRef, BallLayoutProps>(
    ({ rows, ballsPerRow, multipliers = [], probabilities = [], betAmount = 100, onBallHit }, ref) => {
        return (
            <CanvasBallLayout
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

export type { CanvasBallLayoutRef };
export default BallLayout;


