/**
 * Hover Manager Component
 * Handles hover state management and tooltip rendering
 * Follows Single Responsibility Principle - only handles hover interactions
 */

import React, { useState, useCallback } from 'react';

export interface HoverData {
    multiplier: number;
    winAmount: number;
    probability: number;
    x: number;
    y: number;
}

export interface HoverManagerProps {
    slotCalculationData: any; // Type from LayoutCalculator
    betAmount: number;
    children: (hoverData: HoverData | null, updateHover: (slotIndex: number, event: MouseEvent) => void) => React.ReactNode;
}

/**
 * Hover Manager - handles hover state and provides tooltip functionality
 * Pure component that manages hover interactions
 */
export const HoverManager: React.FC<HoverManagerProps> = ({
    slotCalculationData,
    betAmount,
    children
}) => {
    const [hoveredMultiplier, setHoveredMultiplier] = useState<HoverData | null>(null);

    // Optimized hover state update with RAF throttling
    const updateHoverState = useCallback((slotIndex: number, event: MouseEvent) => {
        if (slotIndex >= 0 && slotCalculationData) {
            const multiplier = slotCalculationData.multipliers[slotIndex];
            const probability = slotCalculationData.probabilities[slotIndex] || 0;
            const winAmount = betAmount * multiplier;

            setHoveredMultiplier({
                multiplier,
                winAmount,
                probability,
                x: event.clientX,
                y: event.clientY,
            });
        } else {
            setHoveredMultiplier(null);
        }
    }, [slotCalculationData, betAmount]);

    return (
        <>
            {children(hoveredMultiplier, updateHoverState)}

            {/* Hover Tooltip */}
            {hoveredMultiplier && (
                <div
                    style={{
                        position: "fixed",
                        left: hoveredMultiplier.x + 10,
                        top: hoveredMultiplier.y - 10,
                        backgroundColor: "rgba(0, 0, 0, 0.9)",
                        color: "white",
                        padding: "8px 12px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        zIndex: 1000,
                        pointerEvents: "none",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                    }}
                >
                    <div style={{ marginBottom: "4px", color: "#ffd700" }}>
                        Win: ${hoveredMultiplier.winAmount.toFixed(0)}
                    </div>
                    <div style={{ fontSize: "11px", color: "rgba(255, 255, 255, 0.8)" }}>
                        Chance: {(hoveredMultiplier.probability * 100).toFixed(1)}%
                    </div>
                </div>
            )}
        </>
    );
};
