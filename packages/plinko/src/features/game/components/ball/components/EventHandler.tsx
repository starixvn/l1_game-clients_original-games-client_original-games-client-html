/**
 * Event Handler Component
 * Handles mouse events for the Plinko game
 * Follows Single Responsibility Principle - only handles event management
 */

import React, { useEffect, useRef, useCallback } from 'react';

export interface EventHandlerProps {
    slotCalculationData: any; // Type from LayoutCalculator
    onHoverUpdate: (slotIndex: number, event: MouseEvent) => void;
    children: (containerRef: React.RefObject<HTMLDivElement>) => React.ReactNode;
}

/**
 * Event Handler - manages mouse events for hover interactions
 * Pure component that handles event setup and cleanup
 */
export const EventHandler: React.FC<EventHandlerProps> = ({
    slotCalculationData,
    onHoverUpdate,
    children
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Optimized mouse event handling with better throttling
    const mouseThrottleRef = useRef({
        lastUpdate: 0,
        lastHoveredIndex: -1,
        lastPosition: { x: 0, y: 0 },
        rafId: null as number | null
    });

    // Memoized helper functions to prevent recreation on every render
    const findSlotIndex = useCallback((mouseX: number, lastRowStartX: number, pegGap: number, slotWidth: number, numberOfSlots: number) => {
        // Use same positioning logic as visual slots (between pegs)
        for (let i = 0; i < numberOfSlots; i++) {
            const slotCenterX = lastRowStartX + (i - 0.5) * pegGap; // Center between peg positions
            const slotX = slotCenterX - slotWidth / 2; // Visual slot left edge
            if (mouseX >= slotX && mouseX < slotX + slotWidth) {
                return i;
            }
        }
        return -1;
    }, []);

    // Optimized hover state update with RAF throttling
    const updateHoverState = useCallback((slotIndex: number, event: MouseEvent) => {
        if (mouseThrottleRef.current.lastHoveredIndex === slotIndex) return;

        // Cancel previous RAF if exists
        if (mouseThrottleRef.current.rafId) {
            cancelAnimationFrame(mouseThrottleRef.current.rafId);
        }

        mouseThrottleRef.current.rafId = requestAnimationFrame(() => {
            mouseThrottleRef.current.lastHoveredIndex = slotIndex;
            mouseThrottleRef.current.rafId = null;
            onHoverUpdate(slotIndex, event);
        });
    }, [onHoverUpdate]);

    // Optimized mouse event handling with passive listeners and RAF throttling
    useEffect(() => {
        if (!slotCalculationData) return;

        const { slotAreaTop, slotAreaBottom, lastRowStartX, pegGap, slotWidth, numberOfSlots } = slotCalculationData;

        const handleMouseMove = (event: MouseEvent) => {
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            // Check if mouse is in slot area
            if (mouseY >= slotAreaTop && mouseY <= slotAreaBottom) {
                const slotIndex = findSlotIndex(mouseX, lastRowStartX, pegGap, slotWidth, numberOfSlots);
                updateHoverState(slotIndex, event);
            } else {
                updateHoverState(-1, event);
            }
        };

        const handleMouseLeave = () => {
            updateHoverState(-1, new MouseEvent('mouseleave'));
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove, { passive: true });
            container.addEventListener('mouseleave', handleMouseLeave, { passive: true });
        }

        return () => {
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [slotCalculationData, findSlotIndex, updateHoverState]);

    return <>{children(containerRef)}</>;
};
