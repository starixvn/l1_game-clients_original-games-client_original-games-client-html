import { useCallback, useEffect, useRef, useState } from "react";

interface UseDraggableOptions {
    initialPosition?: { x: number; y: number };
    elementWidth?: number;
    elementHeight?: number;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

interface UseDraggableReturn {
    position: { x: number; y: number };
    isDragging: boolean;
    handleMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
    setPosition: (position: { x: number; y: number }) => void;
}

export const useDraggable = (options: UseDraggableOptions = {}): UseDraggableReturn => {
    const { initialPosition = { x: 0, y: 0 }, elementWidth = 0, elementHeight = 0, onDragStart, onDragEnd } = options;

    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Function to clamp position within window boundaries
    const clampPosition = useCallback(
        (x: number, y: number) => {
            const maxX = window.innerWidth - elementWidth;
            const maxY = window.innerHeight - elementHeight + scrollY;

            return {
                x: Math.max(0, Math.min(x, maxX)),
                y: Math.max(0, Math.min(y, maxY)),
            };
        },
        [elementWidth, elementHeight]
    );

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            // Don't start dragging if clicking on buttons or interactive elements
            if ((e.target as HTMLElement).closest("button, input, textarea, select")) {
                return;
            }

            setIsDragging(true);
            setDragOffset({
                x: e.clientX - position.x,
                y: e.clientY - position.y,
            });

            if (onDragStart) {
                onDragStart();
            }
        },
        [position, onDragStart]
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (isDragging) {
                // Clear previous debounce timer
                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }

                // Set new debounced position update
                debounceTimerRef.current = setTimeout(() => {
                    const newX = e.clientX - dragOffset.x;
                    const newY = e.clientY - dragOffset.y;
                    const clampedPosition = clampPosition(newX, newY);
                    setPosition(clampedPosition);
                }, 10); // 10ms debounce for smooth dragging
            }
        },
        [isDragging, dragOffset, clampPosition]
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);

        // Clear any pending debounce timer
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }

        if (onDragEnd) {
            onDragEnd();
        }
    }, [onDragEnd]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);

            // Clear debounce timer on cleanup
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                debounceTimerRef.current = null;
            }
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    // Wrapper for setPosition that clamps the position
    const setClampedPosition = useCallback(
        (newPosition: { x: number; y: number }) => {
            const clamped = clampPosition(newPosition.x, newPosition.y);
            setPosition(clamped);
        },
        [clampPosition]
    );

    return {
        position,
        isDragging,
        handleMouseDown,
        setPosition: setClampedPosition,
    };
};
