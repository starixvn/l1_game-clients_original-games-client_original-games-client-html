"use client";
import PlinkoCanvas from "./canvas";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { PLINKO_CANVAS_SCALE } from "./constant";
import Slots from "./slots";
import { cn } from "@shared/utils";

const widthSlots = {
    8: 96,
    9: 94.5,
    10: 94,
    11: 93,
    12: 92,
    13: 91.5,
    14: 91,
    15: 91,
    16: 90.5,
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
                <div className={cn("relative mx-auto w-full")} style={{ paddingBottom: "89%" }}>
                    <div
                        className="absolute -bottom-[14px] left-1/2 -translate-x-1/2 h-[30px] translate-y-[100%]"
                        style={{ width: `${widthSlots[numberOfRows]}%` }}
                    >
                        <Slots />
                    </div>
                </div>
                <div className="h-[54px] md:h-[58px]"></div>
            </div>
        </div>
    );
};
export default Game;
