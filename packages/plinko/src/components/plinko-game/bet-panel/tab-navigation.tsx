import { memo } from "react";
const tabs = [
    {
        text: "Manual",
        value: true,
    },
    {
        text: "Auto",
        value: false,
    },
];

const TabNavigation = ({
    activeTab,
    onTabChange,
    isDisabled,
}: {
    activeTab: boolean;
    onTabChange: (tab: boolean) => void;
    isDisabled: boolean;
}) => {
    return (
        <div className="flex">
            {tabs.map((tab) => (
                <button
                    key={tab.text}
                    onClick={() => onTabChange(tab.value)}
                    className={`flex-1 px-4 py-3 text-sm relative text-white md:pt-0 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] disabled:opacity-50 ${
                        activeTab === tab.value ? "after:bg-green-500" : "after:bg-[#2C3545]"
                    }`}
                    disabled={isDisabled}
                >
                    {tab.text}
                </button>
            ))}
        </div>
    );
};

export default memo(TabNavigation);
