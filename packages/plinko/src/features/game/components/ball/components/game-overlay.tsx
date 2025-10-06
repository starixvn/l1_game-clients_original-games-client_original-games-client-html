/**
 * Game Overlay Component
 * Displays game information overlays (badges, debug info)
 * Follows Single Responsibility Principle - only handles overlay UI
 */

import React from 'react';

export interface GameOverlayProps {
    isInitialized: boolean;
    numberOfRows: number;
    multipliers: number[];
}

/**
 * Game Overlay - displays badges and debug information
 * Pure component for overlay UI elements
 */
export const GameOverlay: React.FC<GameOverlayProps> = ({
    isInitialized,
    numberOfRows,
    multipliers
}) => {
    return (
        <>
            {/* Row Count Badge */}
            {isInitialized && (
                <div
                    style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        backgroundColor: "rgba(255, 107, 107, 0.9)",
                        color: "white",
                        fontSize: "12px",
                        fontWeight: "bold",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        zIndex: 100,
                        animation: "fadeInScale 0.3s ease-out",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                >
                    {numberOfRows} Rows
                </div>
            )}

            {/* Debug Info Overlay (Development Mode) */}
            {process.env.NODE_ENV === "development" && isInitialized && (
                <div
                    style={{
                        position: "absolute",
                        top: "5px",
                        left: "5px",
                        backgroundColor: "rgba(0,0,0,0.7)",
                        color: "white",
                        fontSize: "10px",
                        padding: "2px 5px",
                        borderRadius: "3px",
                        zIndex: 100,
                    }}
                >
                    Simplified: {numberOfRows}×{multipliers.length}
                </div>
            )}
        </>
    );
};
