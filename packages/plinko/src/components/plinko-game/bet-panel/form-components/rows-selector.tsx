import React, { memo } from "react";
import { useShallow } from "zustand/shallow";
import usePlinkoGameStore from "@/shared/stores/plinko-game-store";
import { NUMBER_OF_ROWS } from "@/constants";
import Label from "./label";
import { ResourceTypes } from "@shared/resources";
import { useTranslate } from "@tolgee/react";

const RowsSelector = ({ isDisabled }: { isDisabled: boolean }) => {
    const { numberOfRows, setNumberOfRows } = usePlinkoGameStore(
        useShallow((state) => ({
            numberOfRows: state.numberOfRows,
            setNumberOfRows: state.actions.setNumberOfRows,
        }))
    );

    const {t} = useTranslate(ResourceTypes.PLINKO);

    return (
        <div className={`div-setting-row`}>
            <Label title={t("row")} />
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
                    disabled={isDisabled}
                    className="w-full disabled:opacity-50"
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

export default memo(RowsSelector);
