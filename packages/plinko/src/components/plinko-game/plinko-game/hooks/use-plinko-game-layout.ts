import { useRef, useCallback, useMemo } from "react";
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

    const baseGameHeight = isMobile && window.innerHeight < 700 ? Math.max(500, window.innerHeight * 0.65) : 600;
    const scaledHeight = baseGameHeight * Math.min(1, finalScale);

    const wrapperScale = useMemo(() => {
        if (isMobile) {
            return 1.0;
        }

        const frameWrapperWithoutBackgroundElement = gameFrameWrapperWithoutBackgroundRef?.current;
        if (!frameWrapperWithoutBackgroundElement || !mainContainerRef.current) {
            return 1.0;
        }

        const frameRect = frameWrapperWithoutBackgroundElement.getBoundingClientRect();
        const mainRect = mainContainerRef.current.getBoundingClientRect();

        const scaleX = frameRect.width / mainRect.width;
        const scaleY = frameRect.height / mainRect.height;
        const minScale = Math.min(scaleX, scaleY);

        return mainRect.width > frameRect.width || mainRect.height > frameRect.height
            ? Math.min(1, minScale)
            : 1.0;
    }, [finalScale, gameFrameWrapperWithoutBackgroundRef]);

    return {
        mainContainerRef,
        canvasContainerRef,
        slotsContainerRef,
        baseGameHeight,
        scaledHeight,
        wrapperScale
    };
};
