import React, { memo, useCallback } from "react";
import { useShallow } from "zustand/shallow";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { NUMBER_OF_ROWS } from "@plinko/constants";
import Label from "./label";
import { useTranslator } from "@shared/react-hooks";
import { useGameContext } from "@shared/react-contexts";
import { usePlinkoLightningModeGameStore } from "@plinko/shared/stores";

const RowsSelector = ({ isDisabled }: { isDisabled: boolean }) => {
    const { numberOfRows, setNumberOfRows } = usePlinkoGameStore(
        useShallow((state) => ({
            numberOfRows: state.numberOfRows,
            setNumberOfRows: state.actions.setNumberOfRows,
        }))
    );

    const { tolgeeNamespace } = useGameContext();
    const { t } = useTranslator([tolgeeNamespace]);

    const handleRowsChange = useCallback((newValue: number) => {
        const isValid = newValue >= NUMBER_OF_ROWS.MIN && newValue <= NUMBER_OF_ROWS.MAX;

        if (isValid) {
            setNumberOfRows(newValue);
        }
    }, [numberOfRows, setNumberOfRows]);

    const { isLightningMode } = usePlinkoLightningModeGameStore(
        useShallow((state) => ({
            isLightningMode: state.isLightningMode,
            setIsLightningMode: state.actions.setIsLightningMode,
        }))
    );

    if (isLightningMode) {
        return null;
    }

    return (
        <div className={`div-setting-row`}>
            <Label title={t("row")} />
            <div className="flex items-center input p-1 gap-1 rounded-lg h-11 py-2">
                <div className={`min-w-4 mr-1 ml-2 ${isDisabled ? "opacity-50" : ""}`}>
                    <span className="text-sm text-white">{numberOfRows}</span>
                </div>
                <input
                    type="range"
                    min={NUMBER_OF_ROWS.MIN}
                    max={NUMBER_OF_ROWS.MAX}
                    value={numberOfRows}
                    onChange={(e) => handleRowsChange(Number.parseInt(e.target.value))}
                    disabled={isDisabled}
                    className="w-full disabled:opacity-50 mobile-slider touch-manipulation cursor-pointer"
                    style={
                        {
                            "--input-range-progress": `${((numberOfRows - NUMBER_OF_ROWS.MIN) / (NUMBER_OF_ROWS.MAX - NUMBER_OF_ROWS.MIN)) * 100
                                }%`,
                        } as React.CSSProperties
                    }
                />
            </div>
        </div>
    );
};

export default memo(RowsSelector);
