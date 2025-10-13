import { useMemo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { PLINKO_CANVAS_SCALE } from "../constant";
import useGameStore from "@shared/stores/game-store/game-store";
import Tooltip from "./tooltip";
import { getMultiplierColor } from "@plinko/lib/utils/colors-util";

const Slots = () => {
    const gameConfigs = useGameStore((state) => state.gameConfigs);
    const { numberOfRows, gameMode } = usePlinkoGameStore(
        useShallow((state) => ({
            numberOfRows: state.numberOfRows,
            gameMode: state.gameMode,
            finishedBall: state.finishedBall,
        }))
    );

    const odds = useMemo(() => {
        return gameConfigs?.odds?.[gameMode][numberOfRows] as unknown as number[];
    }, [gameMode, numberOfRows, gameConfigs]);

    return odds?.map((item, index) => (
        <Tooltip key={`slot-${index}-${numberOfRows}`} index={index} totalItems={odds.length} odds={item}>
            <span
                key={`${index}-${item}`}
                className={` flex items-center justify-center text-white text-xs font-bold h-[30px]
        rounded-[4px] transition-transform duration-200 [text-shadow:_-1px_-1px_0_#262626,_1px_-1px_0_#262626,_-1px_1px_0_#262626,_1px_1px_0_#262626]`}
                style={{
                    width: `${54 * PLINKO_CANVAS_SCALE[numberOfRows]}px`,
                    margin: `0 ${2 * PLINKO_CANVAS_SCALE[numberOfRows]}px`,
                    backgroundColor: getMultiplierColor(index, gameMode, numberOfRows),
                }}
            >
                {item}
            </span>
        </Tooltip>
    ));
};
export default Slots;
