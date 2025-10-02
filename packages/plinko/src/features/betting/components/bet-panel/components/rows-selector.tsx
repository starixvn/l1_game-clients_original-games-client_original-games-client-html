import React from "react";
import { Label } from "./label";

export const RowsSelector = ({
    rows,
    onRowsChange,
    disabled = false,
}: {
    rows: number;
    onRowsChange: (rows: number) => void;
    disabled?: boolean;
}) => {
    const handleRowsChange = (newRows: number) => {
        if (!disabled && newRows >= 8 && newRows <= 16) {
            onRowsChange(newRows);
        }
    };

    const createClassThumb = (target: string) => {
        const classThumb = "w-5 h-5 bg-green-400 rounded-full border-1 border-green-200 appearance-none shadow-[0_2px_4px_rgba(0,0,0,0.2)]";
        return classThumb
            .split(" ")
            .map((cls) => `[&${target}]:${cls}`)
            .join(" ");
    };

    return (
        <div className={`div-setting-row ${disabled ? "disabled" : ""}`}>
            <Label title="Rows" />
            <div className="flex items-center input p-1 gap-1 rounded-lg h-11">
                <div className="mx-2">
                    <span className="text-sm text-white">{rows}</span>
                </div>
                <input
                    type="range"
                    min="8"
                    max="16"
                    value={rows}
                    onChange={(e) => handleRowsChange(parseInt(e.target.value, 10))}
                    disabled={disabled}
                    className={`w-full h-1 bg-[#FFFFFF33] rounded-lg appearance-none cursor-pointer
                    ${createClassThumb("::-webkit-slider-thumb")}
                    ${createClassThumb("::-moz-range-thumb")}`}
                    style={{
                        background: `linear-gradient(to right, #00C950 0%, #00C950 ${((rows - 8) / 8) * 100}%, #FFFFFF33 ${
                            ((rows - 8) / 8) * 100
                        }%, #FFFFFF33 100%)`,
                    }}
                />
            </div>
        </div>
    );
};
