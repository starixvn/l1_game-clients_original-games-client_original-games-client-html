import { useRef, useMemo, useState, useEffect } from "react";
import { isMobile } from "react-device-detect";

interface UsePlinkoGameLayoutProps {
    numberOfRows: number;
    finalScale: number;
    gameFrameWrapperWithoutBackgroundRef: React.RefObject<HTMLDivElement>;
}

export const usePlinkoGameLayout = ({
    numberOfRows,
    finalScale,
    gameFrameWrapperWithoutBackgroundRef
}: UsePlinkoGameLayoutProps) => {
    const mainContainerRef = useRef<HTMLDivElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const slotsContainerRef = useRef<HTMLDivElement>(null);
    const [isLayoutReady, setIsLayoutReady] = useState(false);

    const baseGameHeight = isMobile && window.innerHeight < 700 ? Math.max(500, window.innerHeight * 0.65) : 600;
    const scaledHeight = baseGameHeight * Math.min(1, finalScale);

    // Ensure layout calculations happen after DOM is ready
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLayoutReady(true);
        }, 150); // Slightly longer delay to ensure all elements are positioned

        return () => clearTimeout(timer);
    }, []);

    const wrapperScale = useMemo(() => {
        if (isMobile || !isLayoutReady) {
            return 1;
        }

        const frameWrapperWithoutBackgroundElement = gameFrameWrapperWithoutBackgroundRef?.current;
        if (!frameWrapperWithoutBackgroundElement || !mainContainerRef.current) {
            return 1;
        }

        const frameRect = frameWrapperWithoutBackgroundElement.getBoundingClientRect();
        const mainRect = mainContainerRef.current.getBoundingClientRect();

        // Only apply wrapper scaling if content would significantly overflow the frame
        // Use a threshold to prevent constant recalculations on minor dimension changes
        const overflowThreshold = 1.1; // Only scale if overflow is more than 10%
        if (mainRect.width > frameRect.width * overflowThreshold || mainRect.height > frameRect.height * overflowThreshold) {
            const scaleX = frameRect.width / mainRect.width;
            const scaleY = frameRect.height / mainRect.height;
            return Math.min(scaleX, scaleY);
        }

        return 1;
    }, [gameFrameWrapperWithoutBackgroundRef, isLayoutReady]); // Don't depend on numberOfRows to avoid interference with scaleValue

    return {
        mainContainerRef,
        canvasContainerRef,
        slotsContainerRef,
        baseGameHeight,
        scaledHeight,
        wrapperScale
    };
};
