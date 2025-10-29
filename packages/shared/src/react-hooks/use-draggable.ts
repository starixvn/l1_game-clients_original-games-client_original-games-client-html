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
    handleMouseDown: (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => void;
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
        (e: React.MouseEvent<HTMLElement> | React.TouchEvent<HTMLElement>) => {
            // Don't start dragging if clicking on buttons or interactive elements
            if ((e.target as HTMLElement).closest("button, input, textarea, select")) {
                return;
            }

            // Prevent default behavior on touch to avoid scrolling
            if ("touches" in e) {
                e.preventDefault();
            }

            setIsDragging(true);

            // Handle both mouse and touch events
            const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
            const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

            setDragOffset({
                x: clientX - position.x,
                y: clientY - position.y,
            });

            if (onDragStart) {
                onDragStart();
            }
        },
        [position, onDragStart]
    );

    const handleMouseMove = useCallback(
        (e: MouseEvent | TouchEvent) => {
            if (isDragging) {
                // Prevent default behavior on touch to avoid scrolling during drag
                if ("touches" in e) {
                    e.preventDefault();
                }

                // Clear previous debounce timer
                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }

                // Set new debounced position update
                debounceTimerRef.current = setTimeout(() => {
                    // Handle both mouse and touch events
                    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
                    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

                    const newX = clientX - dragOffset.x;
                    const newY = clientY - dragOffset.y;
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
            // Add both mouse and touch event listeners
            // Touch listeners need { passive: false } to allow preventDefault()
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
            window.addEventListener("touchmove", handleMouseMove, { passive: false });
            window.addEventListener("touchend", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleMouseMove as EventListener);
            window.removeEventListener("touchend", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("touchmove", handleMouseMove as EventListener);
            window.removeEventListener("touchend", handleMouseUp);

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
