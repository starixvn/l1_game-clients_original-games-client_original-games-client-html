/**
 * Loading Indicator Component
 * Displays loading state for the Plinko game
 * Follows Single Responsibility Principle - only handles loading UI
 */

import React from 'react';

export interface LoadingIndicatorProps {
    isInitialized: boolean;
    numberOfRows: number;
    multipliers: number[];
}

/**
 * Loading Indicator - shows loading state with game information
 * Pure component for loading UI
 */
export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
    isInitialized,
    numberOfRows,
    multipliers
}) => {
    if (isInitialized) {
        return null;
    }

    return (
        <div
            style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
                fontSize: "14px",
                textAlign: "center",
                zIndex: 10,
                animation: "pulse 1.5s ease-in-out infinite",
            }}
        >
            Loading Simplified Plinko Physics...
            <br />
            <small>
                Rows: {numberOfRows} | Slots: {multipliers.length}
            </small>
        </div>
    );
};
