import React, { useState } from "react";
import { MiniItemNext } from "../dot-next";
import BaseDialog from "../../base-dialog";
import { ModalType } from "../../base-dialog/type";
import Styles from "./index.module.scss";

export const RoundHistory = ({
    roundHistory,
    isShowBlink,
    renderItem,
    numberOfItems,
    sideButton,
    sizeNextItem = "",
    statisticPopupContent,
}: {
    roundHistory: any;
    isShowBlink: boolean;
    renderItem: Function;
    numberOfItems: number;
    sideButton?: React.JSX.Element;
    sizeNextItem?: string;
    statisticPopupContent?: React.JSX.Element;
}) => {
    const [isShowStatistic, setIsShowStatistic] = useState(false);

    const renderItemComponent = (result: any, index: number) => {
        return renderItem({ result, index });
    };

    const handleStatisticClick = () => {
        setIsShowStatistic(!isShowStatistic);
    };

    // Clone the sideButton and add onClick handler if it's a statistic button
    const enhancedSideButton = sideButton ? React.cloneElement(sideButton, {
        onClick: handleStatisticClick
    }) : null;

    return (
        <div className="flex items-center">
            <div className="flex gap-1 flex-row-reverse items-center">
                {isShowBlink && <MiniItemNext className={sizeNextItem} />}
                {roundHistory &&
                    [...roundHistory]
                        ?.slice(0, isShowBlink ? numberOfItems - 1 : numberOfItems)
                        .map((result, index) => renderItemComponent(result, index))}
            </div>
            <div className="ml-2">{enhancedSideButton}</div>

            {/* Statistic Popup */}
            {isShowStatistic && statisticPopupContent && (
                <BaseDialog
                    extendedClassName={Styles.statisticPopup}
                    type={ModalType.Center}
                    isOpen={true}
                    enableBackdrop={false}
                    onCloseModal={() => setIsShowStatistic(false)}
                >
                    {React.cloneElement(statisticPopupContent, {
                        onClose: () => setIsShowStatistic(false)
                    })}
                </BaseDialog>
            )}
        </div>
    );
};
