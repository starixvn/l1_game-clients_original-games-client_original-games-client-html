import React from "react";
import { MiniItemNext } from "../dot-next";

export const RoundHistory = ({
    roundHistory,
    isShowBlink,
    renderItem,
    numberOfItems,
    sideButton,
    sizeNextItem = "",
}: {
    roundHistory: any;
    isShowBlink: boolean;
    renderItem: Function;
    numberOfItems: number;
    sideButton?: React.JSX.Element;
    sizeNextItem?: string;
}) => {
    const renderItemComponent = (result: any) => {
        return renderItem({ result });
    };

    return (
        <div className="flex items-center">
            <div className="flex gap-1 flex-row-reverse items-center">
                {isShowBlink && <MiniItemNext className={sizeNextItem} />}
                {roundHistory &&
                    [...roundHistory]
                        ?.slice(0, isShowBlink ? numberOfItems - 1 : numberOfItems)
                        .map((result) => renderItemComponent(result))}
            </div>
            <div className="ml-2">{sideButton}</div>
        </div>
    );
};
