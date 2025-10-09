import { usePopupStore } from "@shared/stores";
import {  useClickSound, useCommonTranslate } from "@shared/react-hooks";
import { memo, ReactElement, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@shared/utils/merge-tailwind-util";
import BaseDialog from "../base-dialog";
import { ModalType } from "../base-dialog/type";
import { useTranslate } from "@tolgee/react";
import { ResourceTypes } from "@shared/resources/type";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LiveStatsModal = ({ data }: { data?: { winAmount?: number; amount?: number } }): ReactElement => {
    const isShowLiveStats = usePopupStore((state) => state.isShowLiveStats);
    const toggleLiveStats = usePopupStore((state) => state.toggleLiveStats);
    const { t: translate } = useCommonTranslate();
    const clickSound = useClickSound();
    const [totalNetProfit, setTotalNetProfit] = useState(0);
    const [netProfitHistory, setNetProfitHistory] = useState<{ time: string; value: number }[]>([]);
    
    // Default values for winAmount and amount if not provided
    const winAmount = useMemo(() => data?.winAmount ?? 0, [data?.winAmount]);
    const amount = useMemo(() => data?.amount ?? 0, [data?.amount]);
    
    const handleCloseModal = () => {
        toggleLiveStats(false);
    };

    useEffect(() => {
        //console.log(data);
        const newTotalNetProfit = Number((totalNetProfit + winAmount - amount).toFixed(2));
        setTotalNetProfit(newTotalNetProfit ?? 0);

        // Add new data point to history
        const currentTime = new Date().toLocaleTimeString();
        setNetProfitHistory((prev) => [...prev, { time: currentTime, value: newTotalNetProfit }]);
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
                    <div className="flex-1 min-h-0 overflow-hidden px-3">
                        {<WrapperLiveStats winAmount={winAmount} amount={amount} netProfitHistory={netProfitHistory} />}
                    </div>
                </div>
            </BaseDialog>
        )
    );
};

const LiveStats = ({
    winAmount,
    amount,
    netProfitHistory,
}): ReactElement<{ winAmount: number; amount: number; netProfitHistory: { time: string; value: number }[] }> => {
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

    const chartOptions = {
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
    };

    return useMemo(() => {
        return (
            <div className="h-full border-none flex flex-col justify-center items-center">
                <div id="information" className="flex gap-2 flex-col w-[228px] h-[102px] bg-[#00000080] rounded-[12px] p-3">
                    <div className="flex justify-between px-5">
                        <div className="flex flex-col">
                            {t("profit")}
                            <div>{netProfitHistory[netProfitHistory.length - 1].value}</div>
                        </div>
                        <div>
                            {t("win")}
                            <div>{winAmount}</div>
                        </div>
                    </div>
                    <div className="flex justify-between px-5">
                        <div className="flex flex-col">
                            {t("bet_amount")}
                            <div>{amount}</div>
                        </div>
                        <div className="flex flex-col">
                            {t("loss")}
                            <div>{winAmount}</div>
                        </div>
                    </div>
                </div>
                <div id="my-chart" className="w-full h-[150px]">
                    {netProfitHistory.length > 0 ? (
                        <Line data={chartData} options={chartOptions} />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
                    )}
                </div>
            </div>
        );
    }, [winAmount, amount, netProfitHistory, chartData, chartOptions, t]);
};

const WrapperLiveStats = memo(LiveStats);

export default LiveStatsModal;
