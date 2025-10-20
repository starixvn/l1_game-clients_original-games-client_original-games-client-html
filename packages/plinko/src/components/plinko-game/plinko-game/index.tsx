"use client";
import React from "react";
import { isMobile } from "react-device-detect";
import PlinkoCanvas from "./canvas";
import Slots from "./slots";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { usePlinkoGameScaling, usePlinkoGameLayout } from "./hooks";
import { VISUAL_CONSTANTS, CANVAS_CONSTANTS } from "./constants/scaling-constants";

interface PlinkoGameProps {
    gameFrameWrapperWithoutBackgroundRef?: React.RefObject<HTMLDivElement>;
}

const PlinkoGame: React.FC<PlinkoGameProps> = ({
    gameFrameWrapperWithoutBackgroundRef
}) => {
    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);

    const { scaleValue, finalScale } = usePlinkoGameScaling({
        numberOfRows,
        gameFrameWrapperRef: gameFrameWrapperWithoutBackgroundRef
    });

    const {
        mainContainerRef,
        canvasContainerRef,
        slotsContainerRef,
        baseGameHeight
    } = usePlinkoGameLayout();


    return (
        <div
            ref={mainContainerRef}
            className={`flex flex-col items-center justify-center relative ${isMobile ? 'min-h-full' : ''}`}
            style={finalScale < 1 ? {
                transform: `scale(${finalScale})`,
                transformOrigin: 'top center',
            } : {}}
        >
            <div
                className="rounded-lg mx-auto w-full overflow-x-hidden pt-5"
                style={{ height: `${baseGameHeight}px` }}
            >
                <div
                    ref={canvasContainerRef}
                    className="absolute origin-top left-1/2 z-[-1]"
                    style={{
                        transform: `translateX(-50%) translateY(${(numberOfRows + numberOfRows / VISUAL_CONSTANTS.CANVAS_TRANSFORM_OFFSET_FACTOR) * (baseGameHeight / CANVAS_CONSTANTS.BASE_GAME_HEIGHT)}px) scale(${scaleValue})`,
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
};

PlinkoGame.displayName = 'PlinkoGame';
export default PlinkoGame;

