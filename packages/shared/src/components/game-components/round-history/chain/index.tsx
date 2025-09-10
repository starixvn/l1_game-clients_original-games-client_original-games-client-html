import React, { useState } from "react";
import { MiniItemNext } from "../dot-next";

export const RoundHistory = ({
    roundHistory,
    isShowBlink,
    renderItem,
    numberOfItems,
    sideButton,
    sizeNextItem = "",
    statisticPopupContent,
    dialogStrategy,
    dialogConfigId,
}: {
    roundHistory: any;
    isShowBlink: boolean;
    renderItem: Function;
    numberOfItems: number;
    sideButton?: React.JSX.Element;
    sizeNextItem?: string;
    statisticPopupContent?: React.JSX.Element;
    dialogStrategy?: any; // Allow custom dialog strategy
    dialogConfigId?: string; // Allow custom dialog configuration
}) => {
    const [showStatistic, setShowStatistic] = useState(false);

    const renderItemComponent = (result: any, index: number) => {
        return renderItem({ result, index });
    };

    const handleStatisticClick = () => {
        setShowStatistic(!showStatistic);
    };

    const handleCloseStatistic = () => {
        setShowStatistic(false);
    };

    return (
        <div className="relative">
            <div className="flex items-center">
                <div className="flex gap-1 flex-row-reverse items-center">
                    {isShowBlink && <MiniItemNext className={sizeNextItem} />}
                    {roundHistory &&
                        [...roundHistory]
                            ?.slice(0, isShowBlink ? numberOfItems - 1 : numberOfItems)
                            .map((result, index) => renderItemComponent(result, index))}
                </div>
                <div className="ml-2">
                    {sideButton && statisticPopupContent ? (
                        <div onClick={handleStatisticClick}>
                            {sideButton}
                        </div>
                    ) : (
                        sideButton
                    )}
                </div>
                {showStatistic && statisticPopupContent && (
                    React.cloneElement(statisticPopupContent as React.ReactElement, { onClose: handleCloseStatistic })
                )}
            </div>

        </div>
    );
};
