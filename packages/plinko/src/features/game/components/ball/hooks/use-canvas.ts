import { useRef, useState, useEffect, useLayoutEffect } from 'react';

interface UseCanvasProps {
    canvasWidth: number;
    canvasHeight: number;
}

interface UseCanvasReturn {
    containerRef: React.RefObject<HTMLDivElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    containerSize: { width: number; height: number };
    canvasScale: number;
}

/**
 * Custom hook for managing canvas and container sizing
 * Handles container resize detection, canvas scaling, and responsive behavior
 */
export const useCanvas = ({
    canvasWidth,
    canvasHeight
}: UseCanvasProps): UseCanvasReturn => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 400, height: 400 });
    const [canvasScale, setCanvasScale] = useState(1);

    // Get container size early
    useLayoutEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    setContainerSize({ width: rect.width, height: rect.height });
                }
            }
        };
        updateSize();
    }, []);

    // Handle container resize and calculate canvas scaling
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const width = rect.width;
                const height = rect.height;

                if (width > 0 && height > 0) {
                    // Update container size
                    setContainerSize({ width, height });

                    // Calculate scale factor - scale to fit container proportionally
                    const scaleX = width / canvasWidth;
                    const scaleY = height / canvasHeight;
                    const scale = Math.min(scaleX, scaleY);

                    setCanvasScale(scale);
                }
            }
        };

        // Initial setup
        handleResize();

        // Set up ResizeObserver for container sizing
        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                const { width, height } = entry.contentRect;
                if (width > 0 && height > 0) {
                    setContainerSize({ width, height });
                }
            }
        });

        // Also listen to window resize as fallback
        const handleWindowResize = () => {
            handleResize();
        };

        window.addEventListener('resize', handleWindowResize);

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [canvasWidth, canvasHeight]);

    return {
        containerRef,
        canvasRef,
        containerSize,
        canvasScale
    };
};
