import React, { useState } from "react";

export const RoundHistory = ({
    renderItem,
    numberOfItems,
    sideButton,
}: {
    renderItem: Function;
    numberOfItems: number;
    sideButton?: React.JSX.Element;
}) => {
    const [roundHistory, setRoundHistory] = useState<boolean[]>([
        false,
        false,
        true,
        false,
        true,
        false,
        false,
        false,
        true,
        false,
        false,
        false,
        true,
        true,
        true,
    ]);
    const [isBlink, setIsBlink] = useState(false);
    const [isHighlight, setIsHighlight] = useState(false);

    const renderItemComponent = (index: number) => {
        if (roundHistory[index] === undefined) {
            return null;
        }
        return renderItem({ index, isBlink, isHighlight, result: roundHistory[index] });
    };
    return (
        <div className="flex items-center">
            <div className="flex gap-1">{Array.from({ length: numberOfItems }).map((_, index) => renderItemComponent(index))}</div>
            <div className="ml-2">{sideButton}</div>
        </div>
    );
};
