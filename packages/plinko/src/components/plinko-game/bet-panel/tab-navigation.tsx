import { useClickSound, useCommonTranslate } from "@shared";
import { memo } from "react";

const tabs = ["manual", "auto"];

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
    return (
        <div className="md:px-3">
            <div className="flex">
                {tabs.map((tab, index) => (
                    <button
                        key={tab}
                        onClick={() => handleClick(index)}
                        className={`flex-1 p-2 text-sm md:text-base relative md:pt-0 disabled:opacity-50 font-semibold ${
                            activeIndex === index ? "text-[#3FEC83]" : "text-white"
                        }`}
                        disabled={isDisabled}
                    >
                        {t(tab)}
                    </button>
                ))}
            </div>
            <div className="relative bg-[#2C3545]">
                <div className="absolute bottom-0 h-[2px] w-full bg-[#2C3545]"></div>

                {/* Glow container */}
                <div
                    className="absolute bottom-0 transition-all duration-300 ease-in-out"
                    style={{
                        width: `${100 / tabs.length}%`,
                        transform: `translateX(${activeIndex * 100}%)`,
                    }}
                >
                    <div
                        className="glow-center"
                        style={{
                            width: "80%",
                            boxShadow: "0px -1px 12px rgba(63, 236, 131, 1), 0px -2px 12px rgba(63, 236, 131, 1)",
                        }}
                    />
                </div>

                {/* Main active line */}
                <div
                    className="absolute bottom-0 border-t-[2px] border-[#3FEC83] transition-all duration-300 ease-in-out"
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
