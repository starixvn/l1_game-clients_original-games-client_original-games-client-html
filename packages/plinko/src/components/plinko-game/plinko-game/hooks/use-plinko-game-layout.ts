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

    // Initialize layout immediately for mobile, or after a short delay for desktop
    useEffect(() => {
        if (isMobile) {
            // Mobile devices typically render faster, initialize immediately
            setIsLayoutReady(true);
        } else {
            // Desktop may need a short delay for layout stability
            const timer = setTimeout(() => {
                setIsLayoutReady(true);
            }, 75);

            return () => clearTimeout(timer);
        }
    }, [isMobile]);

    const wrapperScale = useMemo(() => {
        if (!isLayoutReady) {
            return 1;
        }

        // On mobile, be more conservative with wrapper scaling to avoid over-scaling slots
        const frameWrapperWithoutBackgroundElement = gameFrameWrapperWithoutBackgroundRef?.current;
        if (!frameWrapperWithoutBackgroundElement || !mainContainerRef.current) {
            return 1;
        }

        const frameRect = frameWrapperWithoutBackgroundElement.getBoundingClientRect();
        const mainRect = mainContainerRef.current.getBoundingClientRect();

        // Use different thresholds for mobile vs desktop
        const overflowThreshold = isMobile ? 1.2 : 1.1; // More conservative on mobile
        if (mainRect.width > frameRect.width * overflowThreshold || mainRect.height > frameRect.height * overflowThreshold) {
            const scaleX = frameRect.width / mainRect.width;
            const scaleY = frameRect.height / mainRect.height;
            const calculatedScale = Math.min(scaleX, scaleY);

            // On mobile, don't scale below 0.8 to keep slots readable
            return isMobile ? Math.max(0.8, calculatedScale) : calculatedScale;
        }

        return 1;
    }, [gameFrameWrapperWithoutBackgroundRef, isLayoutReady, isMobile]);

    return {
        mainContainerRef,
        canvasContainerRef,
        slotsContainerRef,
        baseGameHeight,
        scaledHeight,
        wrapperScale
    };
};
