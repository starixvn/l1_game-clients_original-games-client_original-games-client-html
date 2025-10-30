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

export const BetHistoryControl: React.FC<BetHistoryControlProps> = ({
    defaultTab = "all-bets",
    children,
    className
}) => {
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
                label: "High Roller", // Using hardcoded text since translation key doesn't exist
            }
        ];
        
        // Only return tabs based on children length
        return allTabs.slice(0, children.length);
    }, [translateCommon, children.length]);
    
    // Update active tab when children length changes
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
    
    // Get current content based on active tab
    const getCurrentContent = () => {
        if (!shouldShowTabs) {
            return children[0];
        }
        
        const tabIndex = tabs.findIndex(tab => tab.key === activeTab);
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
    
    return (
        <div className={cn(`${styles["bet-history-container"]} rounded-xl bg-primary-bg p-2 h-full border-stroke`, className)}>
            {/* Tab Header */}
            <div className={cn(styles["tab-header"], "flex gap-1 mb-4")}>
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => handleTabClick(tab.key)}
                        className={cn(
                            styles["tab-button"],
                            "flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all duration-200",
                            "border border-transparent",
                            activeTab === tab.key
                                ? "bg-secondary-bg text-white border-stroke font-semibold"
                                : "bg-transparent text-secondary-text hover:text-white hover:bg-secondary-bg"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
            
            {/* Tab Content */}
            <div className={styles["tab-content"]}>
                {getCurrentContent()}
            </div>
        </div>
    );
};

export default BetHistoryControl;