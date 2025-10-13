"use client";
import PlinkoCanvas from "./canvas";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { PLINKO_CANVAS_SCALE } from "./constant";
import Slots from "./slots";

const Game = () => {
    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="rounded-lg mx-auto w-full h-[600px] overflow-x-hidden pt-5">
                <div
                    className="absolute origin-top left-1/2 z-[-1]"
                    style={{
                        transform: `translateX(-50%) translateY(${numberOfRows + numberOfRows / 8}px) scale(${
                            PLINKO_CANVAS_SCALE[numberOfRows]
                        })`,
                    }}
                >
                    <PlinkoCanvas />
                </div>
                <div className="absolute top-[570px] left-0 w-full flex items-center justify-center origin-top">
                    <Slots />
                </div>
            </div>
        </div>
    );
};
export default Game;
