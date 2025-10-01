import React, { useState, useEffect, useCallback } from "react";
import { BetAmountControls, GameModeSelector, RowsSelector } from "../index";
import AutoBetControl from "./auto-bet-control";
// Configuration interfaces for cleaner props
export interface SharedConfig {
    betAmount: number;
    gameMode: "Lightning" | "Low" | "Medium" | "High";
    rows: number;
}

export interface AutoBetConfig {
    numberOfBets: number;
    onWinAction: "Reset" | "Increase";
    onWinPercentage: number;
    onLossAction: "Reset" | "Increase";
    onLossPercentage: number;
    stopOnWin: number;
    stopOnLoss: number;
}

// Section 4.6 - Auto Bet: When switching between Manual & Auto Bet, keep all current configurations (Bet Amount, Game Mode, Rows)
export interface BetControlProps {
    sharedConfig: SharedConfig;
    autoConfig: AutoBetConfig;
    activeTab: "Manual" | "Auto";

    // Event handlers
    onSharedConfigChange: (config: Partial<SharedConfig>) => void;
    onAutoConfigChange: (config: Partial<AutoBetConfig>) => void;
    onTabChange?: (tab: "Manual" | "Auto") => void;

    // Auto bet specific handlers
    onBalanceUpdate?: (newBalance: number) => void;
    onBetResult?: (result: { win: boolean; payout: number; betAmount: number }) => void;
}

const BetControl: React.FC<BetControlProps> = ({
    sharedConfig,
    autoConfig,
    activeTab,
    onSharedConfigChange,
    onAutoConfigChange,
    onTabChange,
}) => {
    // Provide default values if props are undefined for backward compatibility
    const safeSharedConfig = sharedConfig || {
        betAmount: 100,
        gameMode: "Lightning" as const,
        rows: 9,
    };
    const safeAutoConfig = autoConfig || {
        numberOfBets: 20000,
        onWinAction: "Reset" as const,
        onWinPercentage: 0,
        onLossAction: "Reset" as const,
        onLossPercentage: 0,
        stopOnWin: 0,
        stopOnLoss: 0,
    };

    const { betAmount, gameMode, rows } = safeSharedConfig;
    const { numberOfBets, onWinAction, onWinPercentage, onLossAction, onLossPercentage, stopOnWin, stopOnLoss } = safeAutoConfig;

    // Wrapper functions for individual component props
    const handleBetAmountChange = useCallback(
        (amount: number) => {
            onSharedConfigChange({ betAmount: amount });
        },
        [onSharedConfigChange]
    );

    const handleGameModeChange = useCallback(
        (mode: typeof gameMode) => {
            onSharedConfigChange({ gameMode: mode });
        },
        [onSharedConfigChange]
    );

    const handleRowsChange = useCallback(
        (newRows: number) => {
            onSharedConfigChange({ rows: newRows });
        },
        [onSharedConfigChange]
    );

    const handleNumberOfBetsChange = useCallback(
        (bets: number) => {
            onAutoConfigChange({ numberOfBets: bets });
        },
        [onAutoConfigChange]
    );

    const handleWinActionChange = useCallback(
        (action: typeof onWinAction) => {
            onAutoConfigChange({ onWinAction: action });
        },
        [onAutoConfigChange]
    );

    const handleWinPercentageChange = useCallback(
        (percentage: number) => {
            onAutoConfigChange({ onWinPercentage: percentage });
        },
        [onAutoConfigChange]
    );

    const handleLossActionChange = useCallback(
        (action: typeof onLossAction) => {
            onAutoConfigChange({ onLossAction: action });
        },
        [onAutoConfigChange]
    );

    const handleLossPercentageChange = useCallback(
        (percentage: number) => {
            onAutoConfigChange({ onLossPercentage: percentage });
        },
        [onAutoConfigChange]
    );

    const handleStopOnWinChange = useCallback(
        (amount: number) => {
            onAutoConfigChange({ stopOnWin: amount });
        },
        [onAutoConfigChange]
    );

    const handleStopOnLossChange = useCallback(
        (amount: number) => {
            onAutoConfigChange({ stopOnLoss: amount });
        },
        [onAutoConfigChange]
    );

    // Section 4.6: Configuration persistence when switching tabs
    const [manualConfigs, setManualConfigs] = useState(sharedConfig);

    const [autoConfigs, setAutoConfigs] = useState({ ...sharedConfig, ...autoConfig });

    // Internal panel tab state - auto-sync with main tab
    const [panelTab, setPanelTab] = useState<"Manual" | "Auto">(activeTab);

    // Auto-sync panel tab with main tab
    useEffect(() => {
        setPanelTab(activeTab);
    }, [activeTab]);

    // Note: Auto bet progression state is now managed in the main component

    // Update configs when props change
    useEffect(() => {
        if (panelTab === "Manual") {
            setManualConfigs(sharedConfig);
        } else {
            setAutoConfigs({ ...sharedConfig, ...autoConfig });
        }
    }, [panelTab, sharedConfig, autoConfig]);

    // Handle panel tab change with config persistence
    const handlePanelTabChange = useCallback(
        (tab: "Manual" | "Auto") => {
            if (tab === "Manual") {
                // Restore manual configurations
                onSharedConfigChange(manualConfigs);
            } else {
                // Restore auto configurations
                const {
                    numberOfBets,
                    onWinAction,
                    onWinPercentage,
                    onLossAction,
                    onLossPercentage,
                    stopOnWin,
                    stopOnLoss,
                    ...sharedFromAuto
                } = autoConfigs;
                onSharedConfigChange(sharedFromAuto);
                onAutoConfigChange({ numberOfBets, onWinAction, onWinPercentage, onLossAction, onLossPercentage, stopOnWin, stopOnLoss });
            }
            setPanelTab(tab);
            // Update parent activeTab state
            onTabChange?.(tab);
        },
        [manualConfigs, autoConfigs, onSharedConfigChange, onAutoConfigChange, onTabChange, panelTab]
    );

    const isAutoTab = panelTab === "Auto";
    const tabs = ["Manual", "Auto"];
    return (
        <div className="flex flex-col md:flex-col-reverse">
            <div className="md:rounded-none border-stroke rounded-b-none before:rounded-b-none p-4 gap-4">
                {/* Tab Content */}
                <BetAmountControls betAmount={betAmount} onBetAmountChange={handleBetAmountChange} />
                <GameModeSelector gameMode={gameMode} onGameModeChange={handleGameModeChange} />
                <RowsSelector rows={rows} onRowsChange={handleRowsChange} />

                {isAutoTab && <AutoBetControl />}

                {/* Tab Navigation - below Stop on Loss in Auto mode */}
            </div>
            <div className="flex bg-primary-bg">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handlePanelTabChange(tab as "Manual" | "Auto")}
                        className={`flex-1 px-4 py-3 text-sm relative text-white ${
                            panelTab === tab
                                ? "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-green-500"
                                : ""
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BetControl;
