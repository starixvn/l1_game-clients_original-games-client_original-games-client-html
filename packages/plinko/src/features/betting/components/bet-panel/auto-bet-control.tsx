import React from "react";
import { PercentageControl } from "./components/percentage-control";
import { Label } from "./components/label";

interface AutoBetConfig {
    numberOfBets: number;
    onWinAction: "Reset" | "Increase";
    onWinPercentage: number;
    onLossAction: "Reset" | "Increase";
    onLossPercentage: number;
    stopOnWin: number;
    stopOnLoss: number;
}

interface AutoBetControlProps {
    autoConfig?: AutoBetConfig;
    onAutoConfigChange?: (config: Partial<AutoBetConfig>) => void;
}

const AutoBetControl = ({ autoConfig, onAutoConfigChange }: AutoBetControlProps) => {
    // Default values for backward compatibility
    const defaultConfig: AutoBetConfig = {
        numberOfBets: 100,
        onWinAction: "Reset",
        onWinPercentage: 0,
        onLossAction: "Reset",
        onLossPercentage: 0,
        stopOnWin: 0,
        stopOnLoss: 0
    };

    const config = autoConfig || defaultConfig;
    const { numberOfBets, onWinAction, onWinPercentage, onLossAction, onLossPercentage, stopOnWin, stopOnLoss } = config;

    // Safe callback wrapper
    const safeOnChange = (config: Partial<AutoBetConfig>) => {
        onAutoConfigChange?.(config);
    };

    return (
        <div className="flex flex-col gap-4">
            <div>
                <Label title="Number of Bets" />
                <div className="relative">
                    <input
                        type="number"
                        step={1}
                        pattern="[0-9]*"
                        value={numberOfBets}
                        onChange={(e) => safeOnChange({ numberOfBets: parseInt(e.target.value) || 1 })}
                        onFocus={() => (numberOfBets === Infinity ? safeOnChange({ numberOfBets: 0 }) : {})}
                        onBlur={() => safeOnChange({ numberOfBets: numberOfBets === 0 ? Infinity : numberOfBets })}
                        inputMode="numeric"
                        className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11"
                    />
                    {numberOfBets === Infinity && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white">∞</span>}
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                        <button className="h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg" onClick={() => safeOnChange({ numberOfBets: Infinity })}>
                            ∞
                        </button>
                        <button className="h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg" onClick={() => safeOnChange({ numberOfBets: 10 })}>
                            10
                        </button>
                        <button className="h-9 bg-[#2A4770] text-white text-sm px-4 rounded-lg" onClick={() => safeOnChange({ numberOfBets: 100 })}>
                            100
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <Label title="On Win" />
                <PercentageControl
                    isIncreaseOn={onWinAction === "Increase"}
                    setIsIncreaseOn={(isIncrease) => safeOnChange({ onWinAction: isIncrease ? "Increase" : "Reset" })}
                    percentage={onWinPercentage}
                    setPercentage={(percentage) => safeOnChange({ onWinPercentage: percentage })}
                />
            </div>
            <div>
                <Label title="On Loss" />
                <PercentageControl
                    isIncreaseOn={onLossAction === "Increase"}
                    setIsIncreaseOn={(isIncrease) => safeOnChange({ onLossAction: isIncrease ? "Increase" : "Reset" })}
                    percentage={onLossPercentage}
                    setPercentage={(percentage) => safeOnChange({ onLossPercentage: percentage })}
                />
            </div>
            <div>
                <Label title="Stop On Win" />
                <input
                    type="number"
                    step={1}
                    pattern="[0-9]*"
                    value={stopOnWin}
                    onChange={(e) => safeOnChange({ stopOnWin: parseInt(e.target.value) || 0 })}
                    inputMode="numeric"
                    className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11"
                />
            </div>
            <div>
                <Label title="Stop On Loss" />
                <input
                    type="number"
                    step={1}
                    pattern="[0-9]*"
                    value={stopOnLoss}
                    onChange={(e) => safeOnChange({ stopOnLoss: parseInt(e.target.value) || 0 })}
                    inputMode="numeric"
                    className="input text-white text-sm rounded-lg px-3 input-focus w-full h-11"
                />
            </div>
        </div>
    );
};

export default AutoBetControl;
