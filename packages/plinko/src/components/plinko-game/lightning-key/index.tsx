import React, { useState, useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { usePlinkoLightningModeGameStore } from "@plinko/shared/stores";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { generateRandomLightningKey, filterLightningKeyInput } from "./lightning-key-utils";
import { useGetLightningConfig } from "@plinko/shared/hooks/use-get-lightning-config";
import { useClickSound, useCommonTranslate } from "@shared";

const LightningKey: React.FC = () => {
    const clickSound = useClickSound();
    const { t } = useCommonTranslate();
    
    const { isLightningMode, lightningConfig } = usePlinkoLightningModeGameStore(
        useShallow((state) => ({
            isLightningMode: state.isLightningMode,
            lightningConfig: state.lightningConfig,
        }))
    );
    const numberOfDroppingBall = usePlinkoGameStore(
        (state) => state.numberOfDroppingBall
    );
    const { getLightningConfig } = useGetLightningConfig();

    const [isOpen, setIsOpen] = useState(false);
    const [lightningKeyValue, setLightningKeyValue] = useState(lightningConfig?.lightningKey || "");

    useEffect(() => {
        setLightningKeyValue(lightningConfig?.lightningKey || "");
    }, [lightningConfig?.lightningKey]);
    
    const toggleLightningKey = () => {
        clickSound();
        setIsOpen((prev) => !prev);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const filteredValue = filterLightningKeyInput(value);
        setLightningKeyValue(filteredValue);
    };

    const handleClickRandom = () => {
        clickSound();
        const randomString = generateRandomLightningKey();
        setLightningKeyValue(randomString);
    };

    const isChangeDisabled = numberOfDroppingBall > 0 || !lightningKeyValue.trim();

    const handleClickChange = () => {
        clickSound();
        if (lightningKeyValue.trim() && numberOfDroppingBall === 0) {
            getLightningConfig(lightningKeyValue);
        }
    };

    if (!isLightningMode) {
        return null;
    }

    return (
        <div className="absolute top-10 left-4 flex items-center min-w-8 max-h-10 w-auto bg-[linear-gradient(0deg,#04172E_0%,#052D5D_100%)] rounded-lg z-[1000] p-1 cursor-pointer">
            <button type="button" onClick={toggleLightningKey} className="flex items-center justify-center h-full text-2xl p-1 hover:scale-105">
                <i className="icon-lightning-key text-2xl"></i>
            </button>

            {isOpen && (
                <div className="flex items-center gap-1 ml-1">
                    <div className="relative">
                        <input
                            type="text"
                            value={lightningKeyValue}
                            onChange={handleInputChange}
                            maxLength={8}
                            className="text-[#B3BEC1] text-sm font-medium rounded-lg pl-2 pr-8 w-[120px] h-8 bg-[#101721] border border-[#2B3648] focus:outline-none focus:border-[#2B3648]"
                        />
                        <button
                            type="button"
                            onClick={handleClickRandom}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0 hover:bg-gray-700 hover:scale-105 rounded transition-colors duration-200"
                        >
                            <i className="icon-reset text-xl"></i>
                        </button>
                    </div>
                    <button
                        className="flex items-center justify-center h-8 bg-[#2A4770] text-white text-sm px-3 py-2 rounded-lg disabled:opacity-50 hover:scale-105 transition-all duration-200"
                        onClick={handleClickChange}
                        disabled={isChangeDisabled}
                    >
                        {t("button_change")}
                    </button>
                </div>
            )}
        </div>
    );
};

export default LightningKey;
