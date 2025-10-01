import React, { useState, useEffect, useCallback } from "react";
import { BetAmountInput, BetAmountControls, GameModeSelector, RowsSelector } from "../index";
import styles from "./AutoBetPanel.module.scss";
import { logger } from "../../../../services";
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
export interface AutoBetPanelProps {
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

const AutoBetPanel: React.FC<AutoBetPanelProps> = ({
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

    const renderPanelContent = () => {
        const isManualTab = panelTab === "Manual";
        const isAutoTab = panelTab === "Auto";
        const manualTabClass = isManualTab ? styles.manual : styles.auto;
        const autoTabClass = isAutoTab ? styles.manual : styles.auto;

        if (panelTab === "Manual") {
            return (
                <div className={styles.manualPanel}>
                    <div className={styles.manualControls}>
                        <div style={{ width: "357px", maxWidth: "100%" }}>
                            <BetAmountInput betAmount={betAmount} onBetAmountChange={handleBetAmountChange} />
                        </div>

                        <div style={{ width: "357px", maxWidth: "100%" }}>
                            <GameModeSelector gameMode={gameMode} onGameModeChange={handleGameModeChange} />
                        </div>

                        <div style={{ width: "357px", maxWidth: "100%" }}>
                            <RowsSelector rows={rows} onRowsChange={handleRowsChange} />
                        </div>

                        {/* Tab Navigation - below Rows Selector in Manual mode */}
                        <div className={styles.tabUIMobile}>
                            <div
                                className={manualTabClass}
                                onClick={() => handlePanelTabChange("Manual")}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        handlePanelTabChange("Manual");
                                    }
                                }}
                                aria-pressed={isManualTab}
                            >
                                <span className={styles.tabUIMobileE0}>Manual</span>
                            </div>
                            <div
                                className={autoTabClass}
                                onClick={() => handlePanelTabChange("Auto")}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        e.preventDefault();
                                        handlePanelTabChange("Auto");
                                    }
                                }}
                                aria-pressed={isAutoTab}
                            >
                                <span className={styles.tabUIMobileE0}>Auto</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className={styles.autoPanel}>
                <div className={styles.autoControls}>
                    <BetAmountControls betAmount={betAmount} onBetAmountChange={handleBetAmountChange} />

                    {/* Game Mode Selector */}
                    <div style={{ width: "357px", maxWidth: "100%" }}>
                        <GameModeSelector gameMode={gameMode} onGameModeChange={handleGameModeChange} />
                    </div>

                    {/* Rows Selection */}
                    <div style={{ width: "357px", maxWidth: "100%" }}>
                        <RowsSelector rows={rows} onRowsChange={handleRowsChange} />
                    </div>

                    <AutoBetControl />

                    {/* Tab Navigation - below Stop on Loss in Auto mode */}
                    <div className={styles.tabUIMobile}>
                        <div
                            className={manualTabClass}
                            onClick={() => handlePanelTabChange("Manual")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handlePanelTabChange("Manual");
                                }
                            }}
                            aria-pressed={isManualTab}
                        >
                            <span className={styles.tabUIMobileE0}>Manual</span>
                        </div>
                        <div
                            className={autoTabClass}
                            onClick={() => handlePanelTabChange("Auto")}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    handlePanelTabChange("Auto");
                                }
                            }}
                            aria-pressed={isAutoTab}
                        >
                            <span className={styles.tabUIMobileE0}>Auto</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className={styles.autoBetPanel}>
            {/* Tab Content */}
            <div className={styles.panelContent}>{renderPanelContent()}</div>
        </div>
    );
};

export default AutoBetPanel;
