import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useShallow } from "zustand/shallow";
import { usePlinkoLightningModeGameStore } from "@plinko/shared/stores";
import { usePlinkoGameStore } from "@plinko/shared/stores/plinko-game-store";
import { generateRandomLightningKey, filterLightningKeyInput } from "./lightning-key-utils";
import { useGetLightningConfig } from "@plinko/shared/hooks/use-get-lightning-config";
import { useClickSound, useCommonTranslate, useClickOutside, cn, ResourceTypes } from "@shared";
import { useTranslate } from "@tolgee/react";
import { useLightningKeyTooltip } from "./use-lightning-key-tooltip";
const Tooltip = dynamic(() => import("../../../../../shared/src/components/game-components/tooltip"), { ssr: false });

const LightningKey: React.FC = () => {
    const clickSound = useClickSound();
    const { t: translateCommon } = useCommonTranslate();
    const { t: translatePlinko } = useTranslate(ResourceTypes.PLINKO);
    const containerRef = useRef<HTMLDivElement>(null);

    const { isLightningMode, lightningConfig } = usePlinkoLightningModeGameStore(
        useShallow((state) => ({
            isLightningMode: state.isLightningMode,
            lightningConfig: state.lightningConfig,
        }))
    );
    const numberOfDroppingBall = usePlinkoGameStore((state) => state.numberOfDroppingBall);
    const { getLightningConfig } = useGetLightningConfig();

    const [isOpen, setIsOpen] = useState(false);
    const [lightningKeyValue, setLightningKeyValue] = useState(lightningConfig?.lightningKey || "");

    const forceShowTooltip = useLightningKeyTooltip(isLightningMode);

    useEffect(() => {
        setLightningKeyValue(lightningConfig?.lightningKey || "");
    }, [lightningConfig?.lightningKey]);


    const closeLightningKey = useCallback(() => {
        setIsOpen(false);
        setLightningKeyValue(lightningConfig?.lightningKey || "");
    }, [lightningConfig?.lightningKey]);

    const toggleLightningKey = useCallback(() => {
        clickSound();
        setIsOpen((prev) => {
            const newState = !prev;
            if (!newState) {
                setLightningKeyValue(lightningConfig?.lightningKey || "");
            }
            return newState;
        });
    }, [clickSound, lightningConfig?.lightningKey]);

    useClickOutside([containerRef], closeLightningKey);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setLightningKeyValue(filterLightningKeyInput(e.target.value));
    }, []);

    const handleClickRandom = useCallback(() => {
        clickSound();
        setLightningKeyValue(generateRandomLightningKey());
    }, [clickSound]);

    const handleClickChange = useCallback(() => {
        clickSound();
        if (lightningKeyValue.trim() && numberOfDroppingBall === 0) {
            getLightningConfig(lightningKeyValue);
        }
    }, [clickSound, lightningKeyValue, numberOfDroppingBall, getLightningConfig]);

    const isChangeDisabled = numberOfDroppingBall > 0 || !lightningKeyValue.trim();

    if (!isLightningMode) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                "absolute top-12 left-4 flex items-center min-w-8 max-h-10 w-auto p-1 z-[1000] cursor-pointer rounded-lg",
                "bg-[linear-gradient(0deg,#04172E_0%,#052D5D_100%)]"
            )}
        >
            <Tooltip
                message={translatePlinko("tooltip_lightning")}
                forceVisible={forceShowTooltip}
                className="-translate-x-[calc(50%-180px)]"
                classArrow="-translate-x-[calc(50%+180px)]"
            >
                <button
                    type="button"
                    onClick={toggleLightningKey}
                    className="flex items-center justify-center h-full text-2xl p-1 hover:scale-105"
                >
                    <i className="icon-lightning-key text-2xl"></i>
                </button>
            </Tooltip>

            {isOpen && (
                <div className="flex items-center gap-1 ml-1">
                    <div className="relative">
                        <input
                            type="text"
                            value={lightningKeyValue}
                            onChange={handleInputChange}
                            maxLength={8}
                            className={cn(
                                "text-[#B3BEC1] text-sm md:text-base font-medium rounded-lg pl-2 pr-8 w-[120px] h-8",
                                "bg-[#101721] border border-[#2B3648]",
                                "focus:outline-none focus:border-[#2B3648]"
                            )}
                        />
                        <button
                            type="button"
                            onClick={handleClickRandom}
                            className={cn(
                                "absolute right-2 top-1/2 -translate-y-1/2 p-0 rounded",
                                "hover:bg-gray-700 hover:scale-105 transition-all"
                            )}
                        >
                            <i className="icon-reset text-xl"></i>
                        </button>
                    </div>
                    <button
                        className={cn(
                            "flex items-center justify-center h-8 text-white text-sm md:text-base px-3 py-2 rounded-lg",
                            "bg-[#2A4770] transition-all duration-200 hover:scale-105",
                            "disabled:opacity-50"
                        )}
                        onClick={handleClickChange}
                        disabled={isChangeDisabled}
                    >
                        {translateCommon("button_change")}
                    </button>
                </div>
            )}
        </div>
    );
};

export default LightningKey;
