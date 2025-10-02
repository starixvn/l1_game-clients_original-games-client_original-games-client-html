import React from "react";
import { Label } from "./label";
import usePlinkoGameStore from "@/shared/stores/plinko-game-store";
import { useShallow } from "zustand/shallow";
import { NUMBER_OF_ROWS } from "@/constants";

export const RowsSelector = () => {
    const { numberOfRows, setNumberOfRows } = usePlinkoGameStore(
        useShallow((state) => ({
            numberOfRows: state.numberOfRows,
            setNumberOfRows: state.actions.setNumberOfRows,
        }))
    );

    return (
        <div className={`div-setting-row`}>
            <Label title="Rows" />
            <div className="flex items-center input p-1 gap-1 rounded-lg h-11">
                <div className="mx-2">
                    <span className="text-sm text-white">{numberOfRows}</span>
                </div>
                <input
                    type="range"
                    min={NUMBER_OF_ROWS.MIN}
                    max={NUMBER_OF_ROWS.MAX}
                    value={numberOfRows}
                    onChange={(e) => setNumberOfRows(parseInt(e.target.value))}
                    className="w-full"
                    style={
                        {
                            "--input-range-progress": `${
                                ((numberOfRows - NUMBER_OF_ROWS.MIN) / (NUMBER_OF_ROWS.MAX - NUMBER_OF_ROWS.MIN)) * 100
                            }%`,
                        } as React.CSSProperties
                    }
                />
            </div>
        </div>
    );
};
