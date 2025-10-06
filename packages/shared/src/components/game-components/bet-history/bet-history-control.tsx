import React, { useState, useMemo, useEffect } from "react";
import { useCommonTranslate, useClickSound } from "@shared/react-hooks";
import { cn } from "@shared/utils/merge-tailwind-util";
import styles from "./bet-history.module.scss";

export type BetHistoryTab = "all-bets" | "my-bets" | "high-roller";

export interface BetHistoryControlProps {
    defaultTab?: BetHistoryTab | null;
    tabContent: React.ReactNode[];
    className?: string;
}

export const BetHistoryControl: React.FC<BetHistoryControlProps> = ({ defaultTab = "all-bets", tabContent, className }) => {
    const { t: translateCommon } = useCommonTranslate();
    const clickSound = useClickSound();

    // If only one child, don't show tabs
    const shouldShowTabs = tabContent.length > 1;

    // Initialize active tab - ensure it's valid based on available tabs
    const [activeTab, setActiveTab] = useState<BetHistoryTab>(() => {
        const availableTabs = ["all-bets", "my-bets", "high-roller"].slice(0, tabContent.length) as BetHistoryTab[];
        const defaultTabKey: BetHistoryTab = defaultTab || "all-bets";
        return availableTabs.includes(defaultTabKey) ? defaultTabKey : availableTabs[0];
    });

    // Tab configuration - only show tabs based on children length
    const tabs = useMemo(() => {
        const allTabs = [
            {
                key: "all-bets" as BetHistoryTab,
                label: `${translateCommon("all")} ${translateCommon("bet_history")}`,
            },
            {
                key: "my-bets" as BetHistoryTab,
                label: translateCommon("my_bets"),
            },
            {
                key: "high-roller" as BetHistoryTab,
                label: "High Roller",
            },
        ];

        // Only return tabs based on children length
        return allTabs.slice(0, tabContent.length);
    }, [translateCommon, tabContent.length]);

    useEffect(() => {
        const availableTabs = ["all-bets", "my-bets", "high-roller"].slice(0, tabContent.length);
        if (!availableTabs.includes(activeTab)) {
            setActiveTab(availableTabs[0] as BetHistoryTab);
        }
    }, [tabContent.length, activeTab]);

    // Handle tab click
    const handleTabClick = (tabKey: BetHistoryTab) => {
        setActiveTab(tabKey);
        clickSound();
    };

    const getCurrentContent = () => {
        if (!shouldShowTabs) {
            return tabContent[0];
        }

        const tabIndex = tabs.findIndex((tab) => tab.key === activeTab);
        return tabContent[tabIndex] || tabContent[0];
    };

    // If only one child, render it directly without tabs
    if (!shouldShowTabs) {
        return (
            <div className={cn(`${styles["bet-history-container"]} rounded-xl bg-primary-bg p-2 h-full border-stroke`, className)}>
                {tabContent[0]}
            </div>
        );
    }

    const mapperTranslateX = useMemo(() => {
        const tabIndex = tabs.findIndex((tab) => tab.key === activeTab);

        const translateX = tabIndex * 100;
        return translateX;
    }, [tabs, activeTab]);

    return (
        <div className="flex flex-col items-center justify-center w-full">
            {/* Tab Header with Slider */}
            <div
                role="tablist"
                aria-orientation="horizontal"
                className={cn(
                    "bg-primary max-w-[600px] rounded-[12px] border-stroke flex items-center justify-center w-full overflow-hidden  h-12 top-0 z-[100]  border-input sticky mb-4"
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
                        onClick={() => handleTabClick(tab.key)}
                        className={cn(
                            styles["tab-button"],
                            "z-[10] text-sm md:text-base  inline-flex items-center justify-center whitespace-nowrap font-medium transition-all disabled:pointer-events-none disabled:opacity-40 rounded-md bg-none flex-1",
       
                        )}
                        tabIndex={activeTab === tab.key ? 0 : -1}
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
                        transform: `translateX(${mapperTranslateX}%)`,
                        transition: "transform 300ms ease-in-out",
                    }}
                />
            </div>

            {/* Tab Content */}
            <div className={`${styles["bet-history-container"]} w-full rounded-xl p-2 border-stroke`}>{getCurrentContent()}</div>
        </div>
    );
};

export default BetHistoryControl;
