import React, { useState, useEffect, useCallback } from "react";
import { BetAmountControl, GameModeSelector, RowsSelector } from "./components";
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

    // Bet placement handlers
    onPlaceBet?: () => void;
    onStartAutoBet?: () => void;
    onStopAutoBet?: () => void;
    isAutoBetRunning?: boolean;

    // Disabled states
    isDisabled?: boolean;
    disabledMessage?: string;
}

const BetControl: React.FC<BetControlProps> = ({
    sharedConfig,
    autoConfig,
    activeTab,
    onSharedConfigChange,
    onAutoConfigChange,
    onTabChange,
    onPlaceBet,
    onStartAutoBet,
    onStopAutoBet,
    isAutoBetRunning = false,
    isDisabled = false,
    disabledMessage = "",
}) => {
    // Provide default values if props are undefined for backward compatibility
    const safeSharedConfig = sharedConfig || {
        betAmount: 100,
        gameMode: "Lightning" as const,
        rows: 9,
    };

    const { betAmount, gameMode, rows } = safeSharedConfig;

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

    const handleBetClick = () => {
        if (isDisabled) return;

        if (isAutoTab) {
            // Auto bet mode
            if (isAutoBetRunning) {
                onStopAutoBet?.();
            } else {
                onStartAutoBet?.();
            }
        } else {
            // Manual bet mode
            onPlaceBet?.();
        }
    };

    const getBetButtonText = () => {
        if (isDisabled && disabledMessage) {
            return `Bet ${disabledMessage}`;
        }

        if (isAutoTab) {
            return isAutoBetRunning ? 'STOP AUTO BET' : 'START AUTO BET';
        } else {
            return `BET`; //`BET ($${betAmount})`;
        }
    };

    return (
        <div className="flex flex-col md:flex-col-reverse">
            <div className="flex bg-primary-bg">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => handlePanelTabChange(tab as "Manual" | "Auto")}
                        className={`flex-1 px-4 py-3 text-sm relative text-white ${panelTab === tab
                            ? "after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-green-500"
                            : ""
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="flex flex-col gap-4 p-4 md:rounded-none border-stroke rounded-b-none before:rounded-b-none">
                <BetAmountControl betAmount={betAmount} onBetAmountChange={handleBetAmountChange} />
                <GameModeSelector gameMode={gameMode} onGameModeChange={handleGameModeChange} />
                <RowsSelector rows={rows} onRowsChange={handleRowsChange} />

                {isAutoTab && <AutoBetControl autoConfig={autoConfig} onAutoConfigChange={onAutoConfigChange} />}
            </div>
            <button
                className={`text-sm font-bold w-full h-11 rounded-xl mb-4 ${isAutoTab && isAutoBetRunning
                    ? 'bg-gradient-to-l from-red-500 to-red-700'
                    : 'bg-gradient-to-l from-[#1FDC13] to-[#1D9C05]'
                    } shadow-[0_0_8px_rgba(255,255,255,0.3)] ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={handleBetClick}
                disabled={isDisabled}
            >
                {getBetButtonText()}
            </button>
        </div>
    );
};

export default BetControl;
