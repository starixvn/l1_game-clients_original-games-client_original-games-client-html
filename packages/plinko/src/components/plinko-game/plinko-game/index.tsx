"use client";
import PlinkoCanvas from "./canvas";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import Slots from "./slots";
import { LoggerControls } from "@plinko/features/ui/components";
import React, { useState } from "react";
import { usePlinkoGameScaling, usePlinkoGameLayout, usePlinkoGameResize } from "./hooks";

interface GameProps {
    gameFrameWrapperWithoutBackgroundRef?: React.RefObject<HTMLDivElement>;
}

const Game = React.forwardRef<{ getScaledHeight: () => number; getWrapperScale: () => number }, GameProps>((props, ref) => {
    const { gameFrameWrapperWithoutBackgroundRef } = props;

    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);
    const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);

    const { scaleValue, finalScale } = usePlinkoGameScaling({
        numberOfRows,
        viewportWidth,
        gameFrameWrapperWithoutBackgroundRef
    });

    const { mainContainerRef, canvasContainerRef, slotsContainerRef, baseGameHeight, scaledHeight, wrapperScale } = usePlinkoGameLayout({
        numberOfRows,
        finalScale,
        gameFrameWrapperWithoutBackgroundRef
    });

    usePlinkoGameResize({
        numberOfRows,
        viewportWidth,
        setViewportWidth,
        baseGameHeight
    });

    // Expose the scaled height and wrapper scale for parent component to use
    React.useImperativeHandle(ref, () => ({
        getScaledHeight: () => scaledHeight,
        getWrapperScale: () => wrapperScale
    }), [scaledHeight, wrapperScale]);

    return (
        <div
            ref={mainContainerRef}
            className="flex flex-col items-center justify-center relative"
            style={finalScale < 1 ? {
                transform: `scale(${finalScale})`,
                transformOrigin: 'top center',
            } : undefined}
        >
            {/* Logger Controls - positioned above canvas for debugging */}
            {process.env.NODE_ENV === 'development' && (
                <div
                    style={{
                        position: "absolute",
                        top: "10px",
                        left: "10px",
                        right: "10px",
                        zIndex: 10000,
                    }}
                >
                    <LoggerControls className="w-full" />
                </div>
            )}

            <div
                className="rounded-lg mx-auto w-full overflow-x-hidden pt-5"
                style={{ height: `${baseGameHeight}px` }}
            >
                <div
                    ref={canvasContainerRef}
                    className="absolute origin-top left-1/2 z-[-1]"
                    style={{
                        transform: `translateX(-50%) translateY(${(numberOfRows + numberOfRows / 8) * (baseGameHeight / 600)}px) scale(${scaleValue})`,
                    }}
                >
                    <PlinkoCanvas />
                </div>
                <div
                    ref={slotsContainerRef}
                    className="absolute left-0 w-full flex items-center justify-center origin-top"
                    style={{ top: `${baseGameHeight - 30}px` }}
                >
                    <Slots />
                </div>
            </div>
        </div>
    );
});
Game.displayName = 'PlinkoGame';
export default Game;
