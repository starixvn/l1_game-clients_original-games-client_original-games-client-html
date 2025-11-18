import { useClickSound, useCommonTranslate } from "@shared";
import { memo } from "react";
import Image from "next/image";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";

const tabs = ["manual", "auto"];
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const TabNavigation = ({
    activeIndex,
    onChangeTab,
    isDisabled,
}: {
    activeIndex: number;
    onChangeTab: (index: number) => void;
    isDisabled: boolean;
}) => {
    const { t } = useCommonTranslate();
    const clickSound = useClickSound();
    const handleClick = (index: number) => {
        clickSound();
        onChangeTab(index);
    };
    const isDroppingBall = usePlinkoGameStore((state) => state.numberOfDroppingBall > 0);
    return (
        <div className="md:px-3">
            <div className="flex md:mb-[6px] lg:mb-0">
                {tabs.map((tab, index) => (
                    <button
                        key={tab}
                        onClick={() => handleClick(index)}
                        className={`flex-1 p-2 py-[2px] text-sm md:text-base relative md:pt-0 disabled:opacity-50 font-semibold ${
                            activeIndex === index ? "text-[#3FEC83]" : "text-white"
                        }`}
                        disabled={isDisabled || isDroppingBall}
                    >
                        {t(tab)}
                    </button>
                ))}
            </div>
            <div className="relative">
                {/* Background line */}
                <div className="absolute bottom-0 h-[2px] w-full bg-[#2C3545]"></div>

                {/* Glow image container */}
                <div
                    className="absolute bottom-0 left-0 transition-all duration-300 ease-in-out flex items-end justify-center"
                    style={{
                        width: `${100 / tabs.length}%`,
                        transform: `translateX(${activeIndex * 100}%)`,
                    }}
                >
                    <Image
                        src={`${basePath}/static/images/plinko/glow-nav-tab.png`}
                        alt="glow"
                        width={200}
                        height={40}
                        className="w-full h-auto object-contain "
                        style={{
                            filter: "brightness(1.2)",
                        }}
                    />
                </div>

                {/* Main active line */}
                <div
                    className="absolute bottom-0 border-t-[2px] border-[#3FEC83] transition-all duration-300 ease-in-out z-1"
                    style={{
                        width: `${100 / tabs.length}%`,
                        transform: `translateX(${activeIndex * 100}%)`,
                    }}
                />
            </div>
        </div>
    );
};

export default memo(TabNavigation);
