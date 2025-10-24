import { memo } from "react";
import Image from "next/image";
import { buildVersion } from "@shared/constants";
import { getCurrentGameAssets } from "../../../game-config";
import ParticlesContainer from "./particles";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const Background: React.FC = () => {
    const gameAssets = getCurrentGameAssets();

    return (
        <>
            <Image
                src={`${basePath}${gameAssets.backgroundImage}?v=${buildVersion}`}
                alt="Background"
                fill
                className={`absolute top-0 z-[-100] bg-size-[100%_100%] bg-position-center bg-no-repeat w-[calc(100%+24px)] h-full md:left-0 md:w-full md:rounded-tr-xl`}
            />
            <div className="absolute z-[-10] top-0 w-full h-[100px] opacity-70 bg-gradient-to-b from-[#070D16] to-[#17193F00]"></div>

            <div className="absolute z-[-100] h-[862px] w-full overflow-hidden md:h-full">
                {/* CSS-based particle effects */}
                <ParticlesContainer />

                <div
                    id="background-polygon"
                    className="relative h-[862px] w-full bg-center bg-no-repeat"
                    style={{ backgroundImage: `url('${basePath}/static/images/background/polygon.webp?v=${buildVersion}')` }}
                ></div>
            </div>
            <div className="hidden md:block absolute bottom-0 w-full h-[100px] z-[-10] bg-gradient-to-b from-[#17193F00] to-[#070D16]"></div>
        </>
    );
};

export default memo(Background);
