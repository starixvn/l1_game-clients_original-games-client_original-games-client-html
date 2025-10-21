import { usePopupStore } from "@shared/stores";
import { useClickSound, useCommonTranslate } from "@shared/react-hooks";
import { memo, ReactElement, useEffect, useMemo, useState } from "react";
import { cn } from "@shared/utils/merge-tailwind-util";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { useTranslate } from "@tolgee/react";
import { ResourceTypes } from "@shared/resources/type";
import { numberWithCommas } from "@shared/helpers";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { isMobile } from "react-device-detect";
import { AreaChart, Area, XAxis, YAxis } from "recharts";

const LiveStatsModal = ({ data }: { data?: { winAmount?: number; amount?: number } }): ReactElement => {
    const isShowLiveStats = usePopupStore((state) => state.isShowLiveStats);
    const toggleLiveStats = usePopupStore((state) => state.toggleLiveStats);
    const { t: translate } = useCommonTranslate();
    const clickSound = useClickSound();
    const [totalWinAmount, setTotalWinAmount] = useState(0);
    const [totalBetAmount, setTotalBetAmount] = useState(0);
    const [netProfitHistory, setNetProfitHistory] = useState<{ x: number; y: number }[]>([]);
    const [lostRound, setLostRound] = useState(0);
    const [winRound, setWinRound] = useState(0);
    const [dragEnabled, setDragEnabled] = useState(true);
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: 150, y: -910 });

    const { winAmount, amount } = data ?? { winAmount: 0, amount: 0 };

    const handleCloseModal = () => {
        toggleLiveStats(false);
    };
    useEffect(() => {
        const roundNetProfit = Number((winAmount - amount).toFixed(2));
        setTotalBetAmount((prev) => prev + amount);
        setTotalWinAmount((prev) => prev + winAmount);

        if (data) {
            if (roundNetProfit < 0) {
                setLostRound((prev) => prev + 1);
            } else {
                setWinRound((prev) => prev + 1);
            }
        }

        // Calculate cumulative net profit
        setNetProfitHistory((prev) => {
            const lastCumulativeProfit = prev.length > 0 ? prev[prev.length - 1].y : 0;
            const newCumulativeProfit = Number((lastCumulativeProfit + roundNetProfit).toFixed(2));
            return [...prev, { x: prev.length, y: newCumulativeProfit }];
        });
    }, [data]);

    const onDrag = (event: DraggableEvent, data: DraggableData) => {
        setPosition({
            x: position.x + data.deltaX,
            y: position.y + data.deltaY,
        });
    };

    const handleReset = () => {
        setNetProfitHistory([{ x: 0, y: 0 }]);
        setTotalBetAmount(0);
        setTotalWinAmount(0);
        setLostRound(0);
        setWinRound(0);
    };

    return (
        isShowLiveStats && (
            <Draggable disabled={!dragEnabled} onDrag={onDrag} defaultPosition={{ x: isMobile ? 86 : 1030, y: isMobile ? -1223 : -1230 }}>
                <div
                    className="z-[99999] fixed"
                    style={{
                        transform: `translate(${position.x}px,${position.y}px)`,
                    }}
                >
                    <BaseDialog
                        type={ModalType.Full}
                        isOpen={isShowLiveStats}
                        enableBackdrop={false}
                        onCloseModal={handleCloseModal}
                        extendedClassName="h-[302px] w-[254px] top-[200px] left-[50px]"
                    >
                        <div
                            id="live-stats"
                            className={cn("flex flex-col h-full w-full gap-3 rounded-t-2xl", {
                                flex: isShowLiveStats,
                                hidden: !isShowLiveStats,
                            })}
                        >
                            {/* Header */}
                            <div className="flex items-center px-3 gap-2 text-base font-semibold text-primary-text text-center flex-shrink-0">
                                <button
                                    className="cursor-pointer ml-auto relative z-10"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        clickSound();
                                        handleReset();
                                    }}
                                >
                                    <i className="icon-reset" style={{ fontSize: "22px" }}></i>
                                </button>
                                <div className="flex flex-1 items-center justify-center font-semibold text-lg leading-[22px]">
                                    {translate("live_stats")}
                                </div>
                                <button
                                    className="cursor-pointer ml-auto relative z-10"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        clickSound();
                                        handleCloseModal();
                                    }}
                                >
                                    <i className="icon-close" style={{ fontSize: "14px" }}></i>
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-h-0 overflow-hidden px-3">
                                {
                                    <WrapperLiveStats
                                        totalBetAmount={totalBetAmount}
                                        totalWinAmount={totalWinAmount}
                                        netProfitHistory={netProfitHistory}
                                        lostRound={lostRound}
                                        winRound={winRound}
                                    />
                                }
                            </div>
                        </div>
                    </BaseDialog>
                </div>
            </Draggable>
        )
    );
};

const LiveStats = ({
    totalBetAmount,
    totalWinAmount,
    netProfitHistory,
    lostRound,
    winRound,
}): ReactElement<{
    totalBetAmount: number;
    totalWinAmount: number;
    netProfitHistory: { x: number; y: number }[];
    lostRound: number;
    winRound: number;
}> => {
    const { t } = useTranslate(ResourceTypes.COMMON);

    const gradientOffset = () => {
        const dataMax = Math.max(...netProfitHistory.map((i) => i.y));
        const dataMin = Math.min(...netProfitHistory.map((i) => i.y));
        if (dataMax <= 0) {
            return 0;
        }
        if (dataMin >= 0) {
            return 1;
        }

        return dataMax / (dataMax - dataMin);
    };

    const off = gradientOffset();

    const profitAmount = totalWinAmount - totalBetAmount;
    const getColorClass = (amount: number) => {
        if (amount > 0) return "text-winning-highlight";
        if (amount < 0) return "text-red-500";
        return "text-white";
    };

    const profitColorClass = getColorClass(profitAmount);
    const winsColorClass = getColorClass(winRound);

    return useMemo(() => {
        return (
            <div className="h-full border-none flex flex-col justify-center items-center">
                <div id="information" className="flex justify-between  pt-1 w-[228px] h-[102px] bg-[#00000080] rounded-[12px]">
                    <div className="flex flex-col items-start flex-1 px-3 gap-1">
                        <div className="flex flex-col items-start">
                            {t("profit")}
                            <div className={profitColorClass}>{numberWithCommas(profitAmount)}</div>
                        </div>
                        <div className="flex flex-col items-start">
                            {t("bet_amount")}
                            <div>{numberWithCommas(totalBetAmount)}</div>
                        </div>
                    </div>
                    <div className="flex flex-col items-start flex-1 px-3 gap-1">
                        <div className="flex flex-col items-start">
                            {t("wins")}
                            <div className={winsColorClass}>{numberWithCommas(winRound)}</div>
                        </div>
                        <div className="flex flex-col items-start">
                            {t("losses")}
                            <div className={cn(lostRound > 0 ? "text-red-500" : "")}>{numberWithCommas(lostRound)}</div>
                        </div>
                    </div>
                </div>
                <div id="my-chart" className="w-full h-auto">
                    <AreaChart width={228} height={150} data={netProfitHistory}>
                        <XAxis dataKey="x" hide />
                        <YAxis hide domain={[-100, 100]} />
                        <defs>
                            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset={off} stopColor="#00FF44" stopOpacity={1} />
                                <stop offset={off} stopColor="#FF000D" stopOpacity={1} />
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="y" stroke="#000" fill="url(#splitColor)" isAnimationActive={false} baseLine={0} />
                    </AreaChart>
                </div>
            </div>
        );
    }, [netProfitHistory]);
};

const WrapperLiveStats = memo(LiveStats);

export default LiveStatsModal;
