import { useGameStore, usePopupStore } from "@shared/stores";
import ModalContainer from "../modal-container";
import { useAppTheme, useClickSound, useCommonTranslate } from "@shared/react-hooks";
import { memo, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { FC } from "react";
import { tolgee } from "@shared/tolgee";
import { cn } from "@shared/utils/merge-tailwind-util";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { useTranslate } from "@tolgee/react";
import { ResourceTypes } from "@shared/resources/type";

const LiveStatsModal = ({ winAmount, amount }): ReactElement<{ winAmount: number; amount: number }> => {
    const isShowLiveStats = usePopupStore((state) => state.isShowLiveStats);
    const toggleLiveStats = usePopupStore((state) => state.toggleLiveStats);
    const { t: translate } = useCommonTranslate();
    const clickSound = useClickSound();
    const [totalNetProfit, setTotalNetProfit] = useState(0);

    const handleCloseModal = () => {
        toggleLiveStats(false);
    };

    useEffect(() => {
        const newTotalNetProfit = Number((totalNetProfit + winAmount - amount).toFixed(2));
        setTotalNetProfit(newTotalNetProfit ?? 0);
    }, [winAmount, amount]);

    return (
        isShowLiveStats && (
            <BaseDialog
                type={ModalType.Full}
                isOpen={isShowLiveStats}
                enableBackdrop={false}
                onCloseModal={handleCloseModal}
                extendedClassName="h-[302px] w-[254px] top-[200px] left-[50px]"
            >
                <div
                    id="live-stats"
                    className={cn("flex flex-col h-full w-full rounded-t-2xl", {
                        flex: isShowLiveStats,
                        hidden: !isShowLiveStats,
                    })}
                    draggable={true}
                >
                    {/* Header - Fixed height */}
                    <div className="flex items-center px-5 text-base font-semibold text-primary-text text-center my-2 flex-shrink-0">
                        <div className="flex flex-1 items-center justify-center font-semibold text-lg leading-[22px]">
                            {translate("live_stats")}
                        </div>
                        <span
                            className="cursor-pointer ml-auto relative z-10"
                            onClick={() => {
                                clickSound();
                                handleCloseModal();
                            }}
                        >
                            <i className="icon-close text-sm w-4 h-4"></i>
                        </span>
                    </div>

                    {/* Content - Flexible height */}
                    <div className="flex-1 min-h-0 overflow-hidden p-3">{<WrapperLiveStats winAmount={winAmount} amount={amount} />}</div>
                </div>
            </BaseDialog>
        )
    );
};

const LiveStats = ({ winAmount, amount }): ReactElement<{ winAmount: number; amount: number }> => {
    const { t } = useTranslate(ResourceTypes.COMMON);

    return useMemo(() => {
        return (
            <div className="h-full border-none flex flex-col justify-center items-center">
                <div id="information" className="flex flex-col w-[228px] h-[102px]">
                    <div className="flex justify-between px-5">
                        <div className="flex flex-col">
                            {t("profit")}
                            <div>{winAmount - amount}</div>
                        </div>
                        <div>
                            {t("win")}
                            <div>{winAmount}</div>
                        </div>
                    </div>
                    <div className="flex justify-between px-5">
                        <div className="flex flex-col">
                            {t("profit")}
                            <div>{winAmount - amount}</div>
                        </div>
                        <div className="flex flex-col">
                            {t("loss")}
                            <div>{winAmount}</div>
                        </div>
                    </div>
                </div>
                <div id="my-chart" className="w-full h-full"></div>
            </div>
        );
    }, [winAmount, amount]);
};

const WrapperLiveStats = memo(LiveStats);

export default LiveStatsModal;
