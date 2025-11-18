import React, { memo, useCallback, useRef } from "react";
import { useShallow } from "zustand/shallow";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { NUMBER_OF_ROWS } from "@plinko/constants";
import Label from "./label";
import { useTranslator } from "@shared/react-hooks";
import { useGameContext } from "@shared/react-contexts";
import { usePlinkoLightningModeGameStore } from "@plinko/shared/stores";

const RowsSelector = ({ isDisabled }: { isDisabled: boolean }) => {
    const sliderRef = useRef<HTMLInputElement>(null);
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

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

    // Handle touch events to prevent vertical scrolling on iOS
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0];
        if (touch) {
            touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        }
        e.stopPropagation();
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        e.stopPropagation();

        const touch = e.touches[0];
        const startTouch = touchStartRef.current;

        if (touch && startTouch) {
            const deltaX = Math.abs(touch.clientX - startTouch.x);
            const deltaY = Math.abs(touch.clientY - startTouch.y);

            // If vertical movement is greater than horizontal, allow default scroll behavior
            if (deltaY > deltaX) {
                return;
            } else {
                e.preventDefault();
            }
        }
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        touchStartRef.current = null;
        e.stopPropagation();
    }, []);

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
            <div className="flex items-center input p-1 gap-1 rounded-lg h-11">
                <div className={`min-w-4 mr-1 ml-2 ${isDisabled ? "opacity-50" : ""}`}>
                    <span className="text-sm text-white">{numberOfRows}</span>
                </div>
                <input
                    ref={sliderRef}
                    type="range"
                    min={NUMBER_OF_ROWS.MIN}
                    max={NUMBER_OF_ROWS.MAX}
                    value={numberOfRows}
                    onChange={(e) => handleRowsChange(Number.parseInt(e.target.value))}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    disabled={isDisabled}
                    className="w-full disabled:opacity-50 touch-manipulation cursor-pointer"
                    style={
                        {
                            "--input-range-progress": `${((numberOfRows - NUMBER_OF_ROWS.MIN) / (NUMBER_OF_ROWS.MAX - NUMBER_OF_ROWS.MIN)) * 100
                                }%`,
                            touchAction: 'manipulation',
                            WebkitTouchCallout: 'none',
                            WebkitUserSelect: 'none',
                            userSelect: 'none',
                        } as React.CSSProperties
                    }
                />
            </div>
        </div>
    );
};

export default memo(RowsSelector);
