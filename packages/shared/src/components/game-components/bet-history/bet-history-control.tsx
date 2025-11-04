import React, { useState, useMemo } from "react";
import { useCommonTranslate, useClickSound } from "@shared/react-hooks";
import { cn } from "@shared/utils/merge-tailwind-util";
import styles from "./bet-history.module.scss";

export interface BetHistoryControlProps {
    tabContent: React.ReactNode[];
    className?: string;
}

export const BetHistoryControl: React.FC<BetHistoryControlProps> = ({ tabContent, className }) => {
    const { t: translateCommon } = useCommonTranslate();
    const clickSound = useClickSound();
    const shouldShowTabs = tabContent.length > 1;

    const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

    const tabs = useMemo(() => {
        const allTabs = [
            {
                key: "all-bets",
                label: `${translateCommon("all_bets")}`,
            },
            {
                key: "my-bets",
                label: translateCommon("my_bets"),
            },
            {
                key: "high-roller",
                label: "High Roller",
            },
        ];

        return allTabs.slice(0, tabContent.length);
    }, [translateCommon, tabContent.length]);

    const handleTabClick = (index: number) => {
        setActiveTabIndex(index);
        clickSound();
    };

    if (!shouldShowTabs) {
        return (
            <div className={cn(`${styles["bet-history-container"]} rounded-xl bg-primary-bg p-2 h-full border-stroke`, className)}>
                {tabContent[0]}
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center w-full">
            {/* Tab Header with Slider */}
            <div
                role="tablist"
                aria-orientation="horizontal"
                className={cn(
                    "bg-primary max-w-[611px] rounded-[12px] border-stroke flex items-center justify-center w-full overflow-hidden  h-12 top-0 z-[100]  border-input relative mb-3"
                )}
            >
                {tabs.map((tab, index) => (
                    <button
                        key={tab.key}
                        id={`tabs-bet-history-trigger-${tab.key}`}
                        role="tab"
                        data-key={tab.key}
                        data-orientation="horizontal"
                        type="button"
                        onClick={() => handleTabClick(index)}
                        className={cn(
                            styles["tab-button"],
                            "z-[10] text-sm md:text-base  inline-flex items-center justify-center whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-40 rounded-md bg-none flex-1"
                        )}
                        tabIndex={activeTabIndex === index ? 0 : -1}
                        aria-controls={`tabs-bet-history-content-${tab.key}`}
                    >
                        {tab.label}
                    </button>
                ))}

                {/* Slider Indicator */}
                <div
                    role="presentation"
                    data-orientation="horizontal"
                    className="absolute rounded-[12px] h-[80%] z-[1] bg-[#0990FF]"
                    style={{
                        left: "5px",
                        width: `calc(${100 / tabs.length}% - 5px)`,
                        transform: `translateX(${activeTabIndex * 100}%)`,
                        transition: "transform 300ms ease-in-out",
                    }}
                />
            </div>

            <div className={`${styles["bet-history-container"]} w-full rounded-xl p-2 border-stroke`}>
                {tabContent.map((content, index) => (
                    <div
                        key={index}
                        className={activeTabIndex === index ? 'block' : 'hidden'}
                    >
                        {content}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BetHistoryControl;
