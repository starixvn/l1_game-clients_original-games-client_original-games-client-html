import { memo } from "react";
import dynamic from "next/dynamic";
import { getCurrentGameAssets } from "../../../game-config";
import { usePlinkoLightningModeGameStore } from "@plinko/shared/stores";
import { useShallow } from "zustand/shallow";
import { useLowPerformanceDevice } from "@shared";
import { BgCachedImage } from "@shared/components/game-components/cached-image/bg-cached-image";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const gameAssets = getCurrentGameAssets();
const ParticlesContainer = dynamic(() => import("./particles"), { ssr: false });

const Background: React.FC = () => {
    const { isLightningMode } = usePlinkoLightningModeGameStore(
        useShallow((state) => ({
            isLightningMode: state.isLightningMode,
        }))
    );
    const isLowPerformance = useLowPerformanceDevice();

    const backgroundImage = isLightningMode
        ? `${basePath}/static/images/background/lightning-bg.webp`
        : `${basePath}${gameAssets.backgroundImage}`;

    return (
        <>
            <BgCachedImage
                pathImage={backgroundImage}
                className={`absolute top-0 z-[-100] w-[calc(100%+24px)] h-[610px] md:h-full md:left-0 md:w-full md:rounded-tr-xl`}
                backgroundSize="100% 100%"
                backgroundRepeat="no-repeat"
                backgroundPosition="center"
            />
            <div className="absolute z-[-10] top-0 w-full h-[100px] opacity-70 bg-gradient-to-b from-[#070D16] to-[#17193F00]"></div>

            <div className="absolute z-[-100] h-[862px] w-full overflow-hidden md:h-full">
                {/* CSS-based particle effects */}
                {!isLowPerformance && <ParticlesContainer />}

                <BgCachedImage
                    pathImage={`${basePath}/static/images/background/polygon.webp`}
                    className="relative h-[610px] md:h-full w-full"
                    backgroundRepeat="no-repeat"
                    backgroundPosition="top center"
                />
            </div>
            <div className="hidden md:block absolute bottom-0 w-full h-[100px] z-[-10] bg-gradient-to-b from-[#17193F00] to-[#070D16]"></div>
        </>
    );
};

export default memo(Background);
