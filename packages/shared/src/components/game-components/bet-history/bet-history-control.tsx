import React, { useState, useMemo, useEffect } from "react";
import { useCommonTranslate, useClickSound } from "@shared/react-hooks";
import { cn } from "@shared/utils/merge-tailwind-util";
import styles from "./bet-history.module.scss";

export type BetHistoryTab = "all-bets" | "my-bets" | "high-roller";

export interface BetHistoryControlProps {
    defaultTab?: BetHistoryTab | null;
    children: React.ReactNode[];
    className?: string;
}

export const BetHistoryControl: React.FC<BetHistoryControlProps> = ({ defaultTab = "all-bets", children, className }) => {
    const { t: translateCommon } = useCommonTranslate();
    const clickSound = useClickSound();

    // If only one child, don't show tabs
    const shouldShowTabs = children.length > 1;

    // Initialize active tab - ensure it's valid based on available tabs
    const [activeTab, setActiveTab] = useState<BetHistoryTab>(() => {
        const availableTabs = ["all-bets", "my-bets", "high-roller"].slice(0, children.length) as BetHistoryTab[];
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
        return allTabs.slice(0, children.length);
    }, [translateCommon, children.length]);

    useEffect(() => {
        const availableTabs = ["all-bets", "my-bets", "high-roller"].slice(0, children.length);
        if (!availableTabs.includes(activeTab)) {
            setActiveTab(availableTabs[0] as BetHistoryTab);
        }
    }, [children.length, activeTab]);

    // Handle tab click
    const handleTabClick = (tabKey: BetHistoryTab) => {
        setActiveTab(tabKey);
        clickSound();
    };

    const getCurrentContent = () => {
        if (!shouldShowTabs) {
            return children[0];
        }

        const tabIndex = tabs.findIndex((tab) => tab.key === activeTab);
        return children[tabIndex] || children[0];
    };

    // If only one child, render it directly without tabs
    if (!shouldShowTabs) {
        return (
            <div className={cn(`${styles["bet-history-container"]} rounded-xl bg-primary-bg p-2 h-full border-stroke`, className)}>
                {children[0]}
            </div>
        );
    }

    const mapperTranslateX = useMemo(() => {
        const tabIndex = tabs.findIndex((tab) => tab.key === activeTab);

        const translateX = tabIndex * 100; // Each tab is 100% width apart
        return translateX;
    }, [tabs, activeTab]);

    return (
        <div className={cn(`${styles["bet-history-container"]} rounded-xl bg-primary-bg p-2 h-full border-stroke`, className)}>
            {/* Tab Header with Slider */}
            <div
                role="tablist"
                aria-orientation="horizontal"
                className={cn(
                    styles["tab-header"],
                    "flex items-center w-full bg-layer4 overflow-hidden flex-shrink-0 rounded-none h-12 top-0 z-[100] border-b border-input sticky rounded-b-none mb-4"
                )}
            >
                {tabs.map((tab, index) => (
                    <button
                        key={tab.key}
                        id={`tabs-bet-history-trigger-${tab.key}`}
                        role="tab"
                        aria-selected={activeTab === tab.key}
                        data-key={tab.key}
                        data-orientation="horizontal"
                        type="button"
                        onClick={() => handleTabClick(tab.key)}
                        className={cn(
                            styles["tab-button"],
                            "text-sm md:text-base h-full inline-flex items-center justify-center whitespace-nowrap px-3 font-medium transition-all disabled:pointer-events-none disabled:opacity-40 focus-visible:!outline-none focus-visible:!outline-0 rounded-md bg-none flex-1",
                            activeTab === tab.key ? "text-primary" : "text-secondary"
                        )}
                        tabIndex={activeTab === tab.key ? 0 : -1}
                        aria-controls={`tabs-bet-history-content-${tab.key}`}
                        data-selected={activeTab === tab.key ? "" : undefined}
                        data-highlighted={activeTab === tab.key ? "" : undefined}
                    >
                        {tab.label}
                    </button>
                ))}

                {/* Slider Indicator */}
                <div
                    role="presentation"
                    data-orientation="horizontal"
                    className={cn(
                        styles["tab-slider"],
                        "absolute data-[orientation=horizontal]:bottom-[-1px] data-[orientation=vertical]:right-[-1px] data-[orientation=horizontal]:h-0.5 data-[orientation=vertical]:w-0.5 data-[disabled]:opacity-40 slider-track-active"
                    )}
                    style={{
                        width: `${100 / tabs.length}%`,
                        transform: `translateX(${mapperTranslateX}%)`,
                        transition: "transform 300ms ease-in-out",
                    }}
                />
            </div>

            {/* Tab Content */}
            <div className={styles["tab-content"]}>{getCurrentContent()}</div>
        </div>
    );
};

export default BetHistoryControl;
