import { memo, useEffect, useMemo, useState, useRef } from "react";
import { ChipSlider } from "./chip-slider";
import { Chip } from "./chip";
import { useSettingStore } from "@shared/stores/setting-store";
import { useGameStore } from "@shared/stores/game-store/game-store";
import { useShallow } from "zustand/shallow";
import useBettingStore from "@shared/stores/betting-store/betting-store";
import { useClickOutside } from "@shared/react-hooks/use-click-outside";

const ChipControlPanel: React.FC = () => {
    const { gameConfigs, userStakeLevel } = useGameStore(
        useShallow((state) => ({
            gameConfigs: state.gameConfigs,
            userStakeLevel: state.userStakeLevel,
        }))
    );
    const { selectedChip, setSelectedChip, isAutoRebetActive } = useBettingStore(
        useShallow((state) => ({
            selectedChip: state.selectedChip,
            setSelectedChip: state.actions.setSelectedChip,
            isAutoRebetActive: state.isAutoRebetActive,
        }))
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isShowSlider, setIsShowSlider] = useState(false);
    const { chipSettings } = useSettingStore();
    const sliderRef = useRef<HTMLDivElement>(null);
    const chipRef = useRef<HTMLDivElement>(null);

    useClickOutside([sliderRef, chipRef], () => {
        if (isShowSlider) {
            setIsShowSlider(false);
        }
    });

    const chipValues = useMemo(() => {
        if (gameConfigs && userStakeLevel) {
            const maxBet = Math.min(userStakeLevel.maxBet, gameConfigs.maxBet);
            const minBet = Math.max(userStakeLevel.minBet, gameConfigs.minBet);
            return gameConfigs.chips?.map((chip) => +chip).filter((value) => value >= minBet && value <= maxBet) || [];
        }
        return [];
    }, [gameConfigs?.maxBet, gameConfigs?.minBet, gameConfigs?.chips, userStakeLevel]);

    useEffect(() => {
        let index = chipValues.findIndex((chip) => chip === selectedChip);
        if (index === -1) {
            index = 0;
        }
        setCurrentIndex(index);
        const chip = chipValues?.[index];
        chip > 0 && onSelectChip(chip);
    }, [chipValues, selectedChip]);

    const onSelectChip = (chipValue: number) => {
        if (selectedChip !== chipValue) {
            setSelectedChip(chipValue);
        }
        setIsShowSlider(false);
    };

    const findChipSetting = (value) => {
        return chipSettings?.find((c) => c.value === value);
    };

    const onClickPrev = () => {
        if (currentIndex > 0) {
            const index = currentIndex - 1;
            onSelectChip(chipValues[index]);
            setCurrentIndex(index);
        }
    };
    const onClickNext = () => {
        if (currentIndex < chipValues.length - 1) {
            const index = currentIndex + 1;
            onSelectChip(chipValues[index]);
            setCurrentIndex(index);
        }
    };

    return (
        <div className={`relative gap-2 md:mx-4`}>
            <div className={`flex items-center gap-7 ${isAutoRebetActive ? "opacity-50" : ""}`}>
                <IconPrevious isEnabled={currentIndex > 0 && !isAutoRebetActive} onClick={onClickPrev} />
                {/* Mobile */}
                <div ref={chipRef} className="md:hidden">
                    <Chip
                        key={+selectedChip}
                        value={+selectedChip}
                        text={findChipSetting(selectedChip)?.text}
                        color={findChipSetting(selectedChip)?.color}
                        onClickChip={() => !isAutoRebetActive && setIsShowSlider(!isShowSlider)}
                        size={48}
                        fontSize={20}
                    />
                </div>
                {/* Desktop */}
                <div className="hidden relative md:flex justify-center items-center md:w-[280px] md:h-[76px]">
                    {isAutoRebetActive && <div className="absolute left-0 top-0 w-full h-full z-[var(--chip-slider-index)]" />}
                    <ChipSlider chipSettings={chipSettings} chipValues={chipValues} isHideIcons={true} />
                </div>
                <IconNext isEnabled={currentIndex < chipValues.length - 1 && !isAutoRebetActive} onClick={onClickNext} />
            </div>
            <div className={`flex justify-center items-center md:hidden ${isAutoRebetActive ? "opacity-50" : ""}`}>
                {isShowSlider && (
                    <div
                        ref={sliderRef}
                        className="absolute bottom-full w-[328px] h-[58px] rounded-full bg-black/60 z-[var(--chip-slider-index)] flex items-center justify-center"
                    >
                        <ChipSlider chipSettings={chipSettings} chipValues={chipValues} onSelectChip={onSelectChip} />
                    </div>
                )}
            </div>
        </div>
    );
};

const IconPrevious = ({ isEnabled = true, onClick }: { isEnabled?: boolean; onClick: () => void }) => {
    return (
        <div className={`cursor-pointer ${isEnabled ? "opacity-100" : "opacity-50 cursor-auto"}`} onClick={isEnabled ? onClick : undefined}>
            <svg width="52" height="75" viewBox="0 0 52 75" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M8.94146 43.9482C5.95479 41.7943 4.46146 40.7174 3.91957 39.3911C3.42436 38.179 3.42436 36.821 3.91957 35.6089C4.46146 34.2826 5.95479 33.2057 8.94146 31.0518L39.3999 9.08662C43.4244 6.18432 45.4367 4.73317 47.1146 4.77162C48.6403 4.80659 50.0666 5.53648 50.9874 6.75356C52 8.09198 52 10.5729 52 15.5348L52 59.4652C52 64.4271 52 66.908 50.9874 68.2464C50.0666 69.4635 48.6403 70.1934 47.1146 70.2284C45.4367 70.2668 43.4244 68.8157 39.3999 65.9134L8.94146 43.9482Z"
                    fill="url(#paint0_linear_2725_101293)"
                    fillOpacity="0.15"
                />
                <path
                    d="M4.38281 39.2021C3.93712 38.1113 3.93712 36.8887 4.38281 35.7979C4.60983 35.2424 5.04905 34.7032 5.84082 34.0186C6.63455 33.3322 7.73367 32.5393 9.23438 31.457L39.6924 9.49219C41.7126 8.03532 43.2007 6.9634 44.3926 6.25684C45.5902 5.54692 46.4109 5.25561 47.1035 5.27148C48.4765 5.30308 49.7602 5.9604 50.5889 7.05566C51.0067 7.60819 51.2503 8.44378 51.375 9.83008C51.4991 11.2101 51.5 13.0444 51.5 15.5352L51.5 59.4648C51.5 61.9556 51.4991 63.7899 51.375 65.1699C51.2503 66.5562 51.0067 67.3918 50.5889 67.9443C49.7602 69.0396 48.4765 69.6969 47.1035 69.7285C46.4109 69.7444 45.5902 69.4531 44.3926 68.7432C43.2007 68.0366 41.7126 66.9647 39.6924 65.5078L9.23438 43.543C7.73367 42.4607 6.63455 41.6678 5.84082 40.9814C5.04905 40.2968 4.60983 39.7576 4.38281 39.2021Z"
                    stroke="url(#paint1_linear_2725_101293)"
                    strokeOpacity="0.6"
                    style={{ mixBlendMode: "overlay" }}
                />
                <path
                    d="M31.2857 37H22.7143C22.3199 37 22 37.2985 22 37.6667V38.3333C22 38.7015 22.3199 39 22.7143 39H31.2857C31.6801 39 32 38.7015 32 38.3333V37.6667C32 37.2985 31.6801 37 31.2857 37Z"
                    fill="white"
                />
                <defs>
                    <linearGradient id="paint0_linear_2725_101293" x1="0" y1="37.5" x2="52" y2="37.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" />
                        <stop offset="1" stopColor="#1F2346" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_2725_101293" x1="0" y1="37.5" x2="52" y2="37.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" />
                        <stop offset="0.900442" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

const IconNext = ({ isEnabled = true, onClick }: { isEnabled?: boolean; onClick: () => void }) => {
    return (
        <div className={`cursor-pointer ${isEnabled ? "opacity-100" : "opacity-50 cursor-auto"}`} onClick={isEnabled ? onClick : undefined}>
            <svg width="52" height="75" viewBox="0 0 52 75" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M43.0585 43.9482C46.0452 41.7943 47.5385 40.7174 48.0804 39.3911C48.5756 38.179 48.5756 36.821 48.0804 35.6089C47.5385 34.2826 46.0452 33.2057 43.0585 31.0518L12.6001 9.08662C8.5756 6.18432 6.56333 4.73317 4.88544 4.77162C3.35968 4.80659 1.93343 5.53648 1.01262 6.75356C0 8.09198 0 10.5729 0 15.5348L0 59.4652C0 64.4271 0 66.908 1.01262 68.2464C1.93343 69.4635 3.35968 70.1934 4.88544 70.2284C6.56333 70.2668 8.57559 68.8157 12.6001 65.9134L43.0585 43.9482Z"
                    fill="url(#paint0_linear_2725_103971)"
                    fillOpacity="0.15"
                />
                <path
                    d="M47.6172 39.2021C48.0629 38.1113 48.0629 36.8887 47.6172 35.7979C47.3902 35.2424 46.951 34.7032 46.1592 34.0186C45.3654 33.3322 44.2663 32.5393 42.7656 31.457L12.3076 9.49219C10.2874 8.03532 8.79933 6.9634 7.60742 6.25684C6.40983 5.54692 5.58913 5.25561 4.89648 5.27148C3.52345 5.30308 2.23978 5.9604 1.41113 7.05566C0.993288 7.60819 0.749656 8.44378 0.625 9.83008C0.500917 11.2101 0.5 13.0444 0.5 15.5352L0.5 59.4648C0.5 61.9556 0.500917 63.7899 0.625 65.1699C0.749656 66.5562 0.993287 67.3918 1.41113 67.9443C2.23978 69.0396 3.52345 69.6969 4.89648 69.7285C5.58913 69.7444 6.40983 69.4531 7.60742 68.7432C8.79933 68.0366 10.2874 66.9647 12.3076 65.5078L42.7656 43.543C44.2663 42.4607 45.3654 41.6678 46.1592 40.9814C46.951 40.2968 47.3902 39.7576 47.6172 39.2021Z"
                    stroke="url(#paint1_linear_2725_103971)"
                    strokeOpacity="0.6"
                    style={{ mixBlendMode: "overlay" }}
                />
                <path
                    d="M32.1429 36.7143H28.2857V32.8571C28.2857 32.3838 27.9019 32 27.4286 32H26.5714C26.0981 32 25.7143 32.3838 25.7143 32.8571V36.7143H21.8571C21.3838 36.7143 21 37.0981 21 37.5714V38.4286C21 38.9019 21.3838 39.2857 21.8571 39.2857H25.7143V43.1429C25.7143 43.6162 26.0981 44 26.5714 44H27.4286C27.9019 44 28.2857 43.6162 28.2857 43.1429V39.2857H32.1429C32.6162 39.2857 33 38.9019 33 38.4286V37.5714C33 37.0981 32.6162 36.7143 32.1429 36.7143Z"
                    fill="white"
                />
                <defs>
                    <linearGradient id="paint0_linear_2725_103971" x1="52" y1="37.5" x2="0" y2="37.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" />
                        <stop offset="1" stopColor="#1F2346" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_2725_103971" x1="52" y1="37.5" x2="0" y2="37.5" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" />
                        <stop offset="0.900442" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default memo(ChipControlPanel);
