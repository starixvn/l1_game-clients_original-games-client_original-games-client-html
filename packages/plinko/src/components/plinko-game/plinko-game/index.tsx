"use client";
import PlinkoCanvas from "./canvas";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { PLINKO_CANVAS_SCALE } from "./constant";
import Slots from "./slots";

const widthSlots = {
    8: 87,
    9: 87,
    10: 86,
    11: 85,
    12: 85,
    13: 84,
    14: 84,
    15: 83,
    16: 83,
};
const Game = () => {
    const numberOfRows = usePlinkoGameStore((state) => state.numberOfRows);

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative rounded-lg mx-auto w-full max-w-[550px] overflow-hidden pt-3 lg:pt-5">
                <div
                    className="absolute origin-top z-[-1]"
                    style={{
                        transform: `translateY(${numberOfRows + numberOfRows / 8}px) scale(${PLINKO_CANVAS_SCALE[numberOfRows]})`,
                    }}
                >
                    <PlinkoCanvas />
                </div>
                <div className="relative aspect-[660/550] mx-auto">
                    <div
                        className="absolute -bottom-[14px] left-1/2 -translate-x-1/2 h-[30px] translate-y-[100%]"
                        style={{ width: `${widthSlots[numberOfRows]}%` }}
                    >
                        <Slots />
                    </div>
                </div>
                <div className="h-[46px] md:h-[50px]"></div>
            </div>
        </div>
    );
};
export default Game;
