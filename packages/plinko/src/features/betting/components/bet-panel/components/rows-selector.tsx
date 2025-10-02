import React from "react";
import { Label } from "./label";
import usePlinkoBetStore from "@/shared/stores/plinko-bet-store";
import { useShallow } from "zustand/shallow";
import { NUMBER_OF_ROWS } from "@/constants";

export const RowsSelector = () => {
    const { numberOfRows, setNumberOfRows } = usePlinkoBetStore(
        useShallow((state) => ({
            numberOfRows: state.numberOfRows,
            setNumberOfRows: state.actions.setNumberOfRows,
        }))
    );

    const createClassThumb = (target: string) => {
        const classThumb = "w-5 h-5 bg-green-400 rounded-full border-1 border-green-200 appearance-none shadow-[0_2px_4px_rgba(0,0,0,0.2)]";
        return classThumb
            .split(" ")
            .map((cls) => `[&${target}]:${cls}`)
            .join(" ");
    };

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
                    className={`w-full h-1 bg-[#FFFFFF33] rounded-lg appearance-none cursor-pointer
                    ${createClassThumb("::-webkit-slider-thumb")}
                    ${createClassThumb("::-moz-range-thumb")}`}
                    style={{
                        background: `linear-gradient(to right, #00C950 0%, #00C950 ${
                            ((numberOfRows - NUMBER_OF_ROWS.MIN) / (NUMBER_OF_ROWS.MAX - NUMBER_OF_ROWS.MIN)) * 100
                        }%, #FFFFFF33 ${
                            ((numberOfRows - NUMBER_OF_ROWS.MIN) / (NUMBER_OF_ROWS.MAX - NUMBER_OF_ROWS.MIN)) * 100
                        }%, #FFFFFF33 100%)`,
                    }}
                />
            </div>
        </div>
    );
};
