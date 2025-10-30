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
                        className={`flex-1 p-2 text-sm relative text-white md:pt-0 disabled:opacity-50`}
                        disabled={isDisabled}
                    >
                        {t(tab)}
                    </button>
                ))}
            </div>
            <div className="relative bg-[#2C3545]">
                <div className="absolute bottom-0 h-[2px] w-full bg-[#2C3545]"></div>
                <div
                    className="absolute bottom-0 h-[2px] bg-green-500 transition-all duration-300 ease-in-out"
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
