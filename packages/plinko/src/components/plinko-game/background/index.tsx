import { memo } from "react";
import Image from "next/image";
import { buildVersion } from "@shared/constants";
import ParticlesContainer from "./particles";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const Background: React.FC = () => {

    return (
        <>
            <Image
                src={`${basePath}/static/images/background/bg.webp?v=${buildVersion}`}
                alt="Background"
                fill
                className={`absolute top-0 z-[-100] bg-size-[100%_100%] bg-position-center bg-repeat-no-repeat w-[calc(100%+24px)] h-full md:left-0 md:w-full md:rounded-tr-xl`}
            />
            <div className="absolute z-[-100] h-[862px] w-full overflow-hidden md:h-full">
                {/* CSS-based particle effects */}
                <ParticlesContainer />

                <div id="background-polygon"
                    className="relative h-[862px] w-full bg-center"
                    style={{ backgroundImage: `url('${basePath}/static/images/background/polygon.webp?v=${buildVersion}')` }}
                ></div>
            </div>
        </>
    );
};

export default memo(Background);
