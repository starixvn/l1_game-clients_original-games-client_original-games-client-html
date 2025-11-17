import { usePopupStore } from "@shared/stores";
import { useClickSound, useCommonTranslate, useDraggable } from "@shared/react-hooks";
import { memo, ReactElement, useEffect, useMemo, useState } from "react";
import { cn } from "@shared/utils/merge-tailwind-util";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { useTranslate } from "@tolgee/react";
import { ResourceTypes } from "@shared/resources/type";
import { numberWithCommas } from "@shared/helpers";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { useShallow } from "zustand/shallow";
import { capitalizeFirstLetter } from "@shared/helpers/string-helper";

const MODAL_SIZE = {
    WIDTH: 250,
    HEIGHT: 320,
};

interface LiveStatsProps {
    winAmount: number;
    amount: number;
    isWin: boolean;
}

const LiveStatsModal = ({ data }: { data?: LiveStatsProps }): ReactElement => {
    const { isShowLiveStats, toggleLiveStats, x, y } = usePopupStore(
        useShallow((state) => ({ isShowLiveStats: state.isShowLiveStats, toggleLiveStats: state.toggleLiveStats, x: state.x, y: state.y }))
    );
    const { t: translate } = useCommonTranslate();
    const clickSound = useClickSound();
    const [totalWinAmount, setTotalWinAmount] = useState(0);
    const [totalBetAmount, setTotalBetAmount] = useState(0);
    const [netProfitHistory, setNetProfitHistory] = useState<{ x: number; y: number }[]>([]);
    const [lostRound, setLostRound] = useState(0);
    const [winRound, setWinRound] = useState(0);

    const { winAmount, amount } = data ?? { winAmount: 0, amount: 0 };

    // Use draggable hook for drag functionality
    const { position, isDragging, handleMouseDown, setPosition } = useDraggable({
        initialPosition: { x: 0, y: 0 },
        elementWidth: MODAL_SIZE.WIDTH, // Modal width
        elementHeight: MODAL_SIZE.HEIGHT, // Modal height
    });

    const handleCloseModal = () => {
        toggleLiveStats(false);
    };

    useEffect(() => {
        setPosition({ x: x - MODAL_SIZE.WIDTH / 2, y: y - MODAL_SIZE.HEIGHT + scrollY });
    }, [x, y, setPosition]);

    useEffect(() => {
        const roundNetProfit = Number((winAmount - amount).toFixed(2));
        setTotalBetAmount((prev) => prev + amount);
        setTotalWinAmount((prev) => prev + winAmount);

        if (data) {
            if (data.isWin) {
                setWinRound((prev) => prev + 1);
            } else {
                setLostRound((prev) => prev + 1);
            }
        }

        // Calculate cumulative net profit
        setNetProfitHistory((prev) => {
            const lastCumulativeProfit = prev.length > 0 ? prev[prev.length - 1].y : 0;
            const newCumulativeProfit = Number((lastCumulativeProfit + roundNetProfit).toFixed(2));
            return [...prev, { x: prev.length, y: newCumulativeProfit }];
        });
    }, [data]);

    const handleReset = () => {
        setNetProfitHistory([{ x: 0, y: 0 }]);
        setTotalBetAmount(0);
        setTotalWinAmount(0);
        setLostRound(0);
        setWinRound(0);
    };

    return (
        isShowLiveStats && (
            <div className="z-[200] absolute" style={{ top: position.y, left: position.x }}>
                <BaseDialog
                    type={ModalType.Full}
                    isOpen={isShowLiveStats}
                    enableBackdrop={false}
                    onCloseModal={handleCloseModal}
                    extendedClassName="absolute h-fit min-h-[320px] min-w-[254px] w-fit top-0 rounded-b-xl border-none"
                >
                    <div
                        id="live-stats"
                        className={cn(
                            "flex flex-col h-full w-full gap-3 rounded-t-2xl",
                            {
                                flex: isShowLiveStats,
                                hidden: !isShowLiveStats,
                            },
                            {
                                "cursor-grab": !isDragging,
                                "cursor-grabbing": isDragging,
                            }
                        )}
                        style={{ touchAction: "none" }}
                        onMouseDown={handleMouseDown}
                        onTouchStart={handleMouseDown}
                    >
                        {/* Header */}
                        <div
                            className={cn(
                                "flex items-center px-4 gap-2 text-base font-semibold text-primary-text text-center flex-shrink-0 select-none"
                            )}
                        >
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
                            <div className="flex flex-1 items-center justify-center font-semibold leading-[22px]">
                                {translate("live_stats")}
                            </div>
                            <button
                                className="cursor-pointer ml-auto relative z-10 p-1 pr-0"
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
        if (amount > 0) {
            return "text-winning-highlight";
        }
        if (amount < 0) {
            return "text-red-500";
        }
        return "text-white";
    };

    const profitColorClass = getColorClass(profitAmount);
    const winsColorClass = getColorClass(winRound);

    return useMemo(() => {
        return (
            <div className="h-full border-none flex flex-col justify-center items-center ">
                <div
                    id="information"
                    className="px-4 py-1 text-sm md:text-base font-semibold flex justify-between  min-w-[228px] w-fit min-h-[102px] bg-[#00000080] rounded-[16px] whitespace-nowrap"
                >
                    <div className="flex flex-col items-start flex-1 gap-1">
                        <div className="flex flex-col items-start gap-1">
                            {capitalizeFirstLetter(t("profit"))}
                            <div className={`${profitColorClass} font-[400]`}>{numberWithCommas(profitAmount)}</div>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                            {capitalizeFirstLetter(t("wagered"))}
                            <div className="font-[400]">{numberWithCommas(totalBetAmount)}</div>
                        </div>
                    </div>
                    <div className="flex flex-col items-start flex-1 gap-1">
                        <div className="flex flex-col items-start gap-1">
                            {capitalizeFirstLetter(t("wins"))}
                            <div className={`${winsColorClass} font-[400]`}>{numberWithCommas(winRound)}</div>
                        </div>
                        <div className="flex flex-col items-start gap-1">
                            {capitalizeFirstLetter(t("losses"))}
                            <div className={cn(lostRound > 0 ? "text-red-500" : "", "font-[400]")}>{numberWithCommas(lostRound)}</div>
                        </div>
                    </div>
                </div>
                <div id="my-chart" className="w-full h-auto [&_svg]:outline-none [&_svg:focus]:outline-none [&_*]:outline-none">
                    <ResponsiveContainer width="100%" height={150}>
                        <AreaChart  data={netProfitHistory}>
                            <XAxis dataKey="x" hide />
                            <YAxis hide domain={[dataMin => dataMin, dataMax => dataMax]} />
                            <defs>
                                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset={off} stopColor="#00FF44" stopOpacity={1} />
                                    <stop offset={off} stopColor="#FF000D" stopOpacity={1} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="y"
                                stroke="none"
                                fill="url(#splitColor)"
                                isAnimationActive={false}
                                baseLine={0}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }, [netProfitHistory]);
};

const WrapperLiveStats = memo(LiveStats);

export default LiveStatsModal;
