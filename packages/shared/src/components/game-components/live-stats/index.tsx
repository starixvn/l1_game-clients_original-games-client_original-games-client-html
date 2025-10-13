import { usePopupStore } from "@shared/stores";
import { useClickSound, useCommonTranslate } from "@shared/react-hooks";
import { memo, ReactElement, useEffect, useMemo, useState } from "react";
import { cn } from "@shared/utils/merge-tailwind-util";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { useTranslate } from "@tolgee/react";
import { ResourceTypes } from "@shared/resources/type";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import { numberWithCommas } from "@shared/helpers";
import Draggable , { DraggableData, DraggableEvent } from "react-draggable";
import { isMobile } from "react-device-detect";
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LiveStatsModal = ({ data }: { data?: { winAmount?: number; amount?: number } }): ReactElement => {
    const isShowLiveStats = usePopupStore((state) => state.isShowLiveStats);
    const toggleLiveStats = usePopupStore((state) => state.toggleLiveStats);
    const { t: translate } = useCommonTranslate();
    const clickSound = useClickSound();
    const [totalWinAmount, setTotalWinAmount] = useState(0);
    const [totalBetAmount, setTotalBetAmount] = useState(0);
    const [netProfitHistory, setNetProfitHistory] = useState<{ time: string; value: number }[]>([]);
    const [lostRound, setLostRound] = useState(0);
    const [winRound, setWinRound] = useState(0);
    const [dragEnabled, setDragEnabled] = useState(true);
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: 150, y: -910 });

    // Default values for winAmount and amount if not provided
    const { winAmount, amount } = data ?? { winAmount: 0, amount: 0 };

    const handleCloseModal = () => {
        toggleLiveStats(false);
    };
    useEffect(() => {
        const newTotalNetProfit = Number((winAmount - amount).toFixed(2));
        setTotalBetAmount((prev) => prev + amount);
        setTotalWinAmount((prev) => prev + winAmount);

        if (data) {
            if (newTotalNetProfit < 0) {
                setLostRound((prev) => prev + 1);
            } else {
                setWinRound((prev) => prev + 1);
            }
        }

        const currentTime = new Date().toLocaleTimeString();
        setNetProfitHistory((prev) => [...prev, { time: currentTime, value: newTotalNetProfit }]);
    }, [data]);

    const onDrag = (event: DraggableEvent, data: DraggableData) => {
        setPosition({
            x: position.x + data.deltaX,
            y: position.y + data.deltaY,
        });
    };

    return (
        isShowLiveStats && (
            <Draggable disabled={!dragEnabled} onDrag={onDrag} defaultPosition={{ x: isMobile ? 86 : 1030, y: isMobile ? -1223 : -1230 }}>
                <div
                    className="z-[301] absolute"
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
                            <div className="flex items-center px-5 text-base font-semibold text-primary-text text-center flex-shrink-0">
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
    netProfitHistory: { time: string; value: number }[];
    lostRound: number;
    winRound: number;
}> => {
    const { t } = useTranslate(ResourceTypes.COMMON);

    const chartData = useMemo(() => {
        const labels = netProfitHistory.map((item) => item.time);
        const data = netProfitHistory.map((item) => item.value);
        return {
            labels: labels,
            datasets: [
                {
                    label: "My Line",
                    data: data,
                    borderWidth: 2,
                    fill: false,
                    tension: 0.1,
                    segment: {
                        borderColor: (ctx) => {
                            const idxNext = ctx.p1DataIndex;
                            if (data[idxNext] >= 0) {
                                return "gold";
                            } else {
                                return "red";
                            }
                        },
                    },
                },
            ],
        };
    }, [netProfitHistory]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: false,
            },
        },
        scales: {
            x: {
                display: false,
            },
            y: {
                display: false,
            },
        },
        elements: {
            point: {
                radius: 0,
                hoverRadius: 0,
            },
        },
        interaction: {
            intersect: false,
        },
    }), []);

    return useMemo(() => {
        return (
            <div className="h-full border-none flex flex-col justify-center items-center">
                <div id="information" className="flex justify-between px-1 pt-1  w-[228px] h-[102px] bg-[#00000080] rounded-[12px]">
                    <div className="flex flex-col justify-between flex-1 px-5 gap-1">
                        <div className="flex flex-col items-center">
                            {t("profit")}
                            <div>{numberWithCommas(totalWinAmount - totalBetAmount)}</div>
                        </div>
                        <div className="flex flex-col items-center">
                            {t("bet_amount")}
                            <div>{numberWithCommas(totalBetAmount)}</div>
                        </div>
                    </div>
                    <div className="flex  flex-col flex-1 px-5 gap-1">
                        <div className="flex flex-col items-center">
                            {t("wins")}
                            <div>{numberWithCommas(winRound)}</div>
                        </div>
                        <div className="flex flex-col items-center">
                            {t("losses")}
                            <div>{numberWithCommas(lostRound)}</div>
                        </div>
                    </div>
                </div>
                <div id="my-chart" className="w-full h-auto">
                    {netProfitHistory.length > 0 ? (
                        <Line data={chartData} options={chartOptions} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
                    )}
                </div>
            </div>
        );
    }, [netProfitHistory, chartData, chartOptions]);
};

const WrapperLiveStats = memo(LiveStats);

export default LiveStatsModal;
