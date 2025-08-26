import { memo, useEffect, useMemo, useState } from "react";
import { ChipSlider } from "./chip-slider";
import { Chip } from "./chip";
import { useSettingContext } from "../../../_shared/react-contexts";
import { useGameStore } from "../../../_shared/stores/game-store/game-store";
import { useShallow } from "zustand/shallow";
import useBettingStore from "../../../_shared/stores/betting-store/betting-store";

const ChipControlPanel: React.FC = () => {
    const { gameConfigs, userStakeLevel } = useGameStore(
        useShallow((state) => ({
            gameConfigs: state.gameConfigs,
            userStakeLevel: state.userStakeLevel,
        }))
    );
    const [selectedChip, setSelectedChip] = useBettingStore(useShallow((state) => [state.selectedChip, state.actions.setSelectedChip]));
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isShowSlider, setIsShowSlider] = useState(false);
    const { chipSettings } = useSettingContext();
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
        <div className="flex relative justify-center items-center gap-2">
            <IconPrevious isEnabled={currentIndex > 0} onClick={onClickPrev} />
            <Chip
                key={+selectedChip}
                value={+selectedChip}
                text={findChipSetting(selectedChip)?.text}
                color={findChipSetting(selectedChip)?.color}
                onClickChip={() => setIsShowSlider(!isShowSlider)}
                size={60}
                fontSize={20}
            />
            <IconNext isEnabled={currentIndex < chipValues.length - 1} onClick={onClickNext} />

            {isShowSlider && (
                <div className="absolute bottom-full w-[328px] h-[58px] rounded-full bg-black/60 z-[var(--chip-slider-index)] flex items-center justify-center">
                    <ChipSlider chipSettings={chipSettings} chipValues={chipValues} onSelectChip={onSelectChip} />
                </div>
            )}
        </div>
    );
};

const IconPrevious = ({ isEnabled = true, onClick }: { isEnabled?: boolean; onClick: () => void }) => {
    return (
        <div
            className={`cursor-pointer transition-all duration-300  ${
                isEnabled ? "hover:scale-110 opacity-100" : "opacity-50 cursor-auto"
            }`}
            onClick={isEnabled ? onClick : undefined}
        >
            <svg width="53" height="76" viewBox="0 0 53 76" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M43.5585 44.4482C46.5452 42.2943 48.0385 41.2174 48.5804 39.8911C49.0756 38.679 49.0756 37.321 48.5804 36.1089C48.0385 34.7826 46.5452 33.7057 43.5585 31.5518L13.1001 9.58662C9.0756 6.68432 7.06333 5.23317 5.38544 5.27162C3.85968 5.30659 2.43343 6.03648 1.51262 7.25356C0.5 8.59198 0.5 11.0729 0.5 16.0348L0.5 59.9652C0.5 64.9271 0.5 67.408 1.51262 68.7464C2.43343 69.9635 3.85968 70.6934 5.38544 70.7284C7.06333 70.7668 9.07559 69.3157 13.1001 66.4134L43.5585 44.4482Z"
                    fill="url(#paint0_linear_679_10580)"
                    fillOpacity="0.15"
                />
                <path
                    d="M48.1172 39.7021C48.5629 38.6113 48.5629 37.3887 48.1172 36.2979C47.8902 35.7424 47.451 35.2032 46.6592 34.5186C45.8654 33.8322 44.7663 33.0393 43.2656 31.957L12.8076 9.99219C10.7874 8.53532 9.29933 7.4634 8.10742 6.75684C6.90983 6.04692 6.08913 5.75561 5.39648 5.77148C4.02345 5.80308 2.73978 6.4604 1.91113 7.55566C1.49329 8.10819 1.24966 8.94378 1.125 10.3301C1.00092 11.7101 1 13.5444 1 16.0352L1 59.9648C1 62.4556 1.00092 64.2899 1.125 65.6699C1.24966 67.0562 1.49329 67.8918 1.91113 68.4443C2.73978 69.5396 4.02345 70.1969 5.39648 70.2285C6.08913 70.2444 6.90983 69.9531 8.10742 69.2432C9.29933 68.5366 10.7874 67.4647 12.8076 66.0078L43.2656 44.043C44.7663 42.9607 45.8654 42.1678 46.6592 41.4814C47.451 40.7968 47.8902 40.2576 48.1172 39.7021Z"
                    stroke="url(#paint1_linear_679_10580)"
                    strokeOpacity="0.6"
                    style={{ mixBlendMode: "overlay" }}
                />
                <path
                    d="M21.2143 37.5H29.7857C30.1801 37.5 30.5 37.7985 30.5 38.1667V38.8333C30.5 39.2015 30.1801 39.5 29.7857 39.5H21.2143C20.8199 39.5 20.5 39.2015 20.5 38.8333V38.1667C20.5 37.7985 20.8199 37.5 21.2143 37.5Z"
                    fill="white"
                />
                <defs>
                    <linearGradient id="paint0_linear_679_10580" x1="52.5" y1="38" x2="0.5" y2="38" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" />
                        <stop offset="1" stopColor="#1F2346" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_679_10580" x1="52.5" y1="38" x2="0.5" y2="38" gradientUnits="userSpaceOnUse">
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
        <div
            className={`cursor-pointer transition-all duration-300  ${
                isEnabled ? "hover:scale-110 opacity-100" : "opacity-50 cursor-auto"
            }`}
            onClick={isEnabled ? onClick : undefined}
        >
            <svg width="53" height="76" viewBox="0 0 53 76" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M9.44146 44.4482C6.45479 42.2943 4.96146 41.2174 4.41957 39.8911C3.92436 38.679 3.92436 37.321 4.41957 36.1089C4.96146 34.7826 6.45479 33.7057 9.44146 31.5518L39.8999 9.58662C43.9244 6.68432 45.9367 5.23317 47.6146 5.27162C49.1403 5.30659 50.5666 6.03648 51.4874 7.25356C52.5 8.59198 52.5 11.0729 52.5 16.0348L52.5 59.9652C52.5 64.9271 52.5 67.408 51.4874 68.7464C50.5666 69.9635 49.1403 70.6934 47.6146 70.7284C45.9367 70.7668 43.9244 69.3157 39.8999 66.4134L9.44146 44.4482Z"
                    fill="url(#paint0_linear_679_10664)"
                    fillOpacity="0.15"
                />
                <path
                    d="M4.88281 39.7021C4.43712 38.6113 4.43712 37.3887 4.88281 36.2979C5.10983 35.7424 5.54905 35.2032 6.34082 34.5186C7.13455 33.8322 8.23367 33.0393 9.73438 31.957L40.1924 9.99219C42.2126 8.53532 43.7007 7.4634 44.8926 6.75684C46.0902 6.04692 46.9109 5.75561 47.6035 5.77148C48.9765 5.80308 50.2602 6.4604 51.0889 7.55566C51.5067 8.10819 51.7503 8.94378 51.875 10.3301C51.9991 11.7101 52 13.5444 52 16.0352L52 59.9648C52 62.4556 51.9991 64.2899 51.875 65.6699C51.7503 67.0562 51.5067 67.8918 51.0889 68.4443C50.2602 69.5396 48.9765 70.1969 47.6035 70.2285C46.9109 70.2444 46.0902 69.9531 44.8926 69.2432C43.7007 68.5366 42.2126 67.4647 40.1924 66.0078L9.73438 44.043C8.23367 42.9607 7.13455 42.1678 6.34082 41.4814C5.54905 40.7968 5.10983 40.2576 4.88281 39.7021Z"
                    stroke="url(#paint1_linear_679_10664)"
                    strokeOpacity="0.6"
                    style={{ mixBlendMode: "overlay" }}
                />
                <path
                    d="M32.6429 37.2143H28.7857V33.3571C28.7857 32.8838 28.4019 32.5 27.9286 32.5H27.0714C26.5981 32.5 26.2143 32.8838 26.2143 33.3571V37.2143H22.3571C21.8838 37.2143 21.5 37.5981 21.5 38.0714V38.9286C21.5 39.4019 21.8838 39.7857 22.3571 39.7857H26.2143V43.6429C26.2143 44.1162 26.5981 44.5 27.0714 44.5H27.9286C28.4019 44.5 28.7857 44.1162 28.7857 43.6429V39.7857H32.6429C33.1162 39.7857 33.5 39.4019 33.5 38.9286V38.0714C33.5 37.5981 33.1162 37.2143 32.6429 37.2143Z"
                    fill="white"
                />
                <defs>
                    <linearGradient id="paint0_linear_679_10664" x1="0.5" y1="38" x2="52.5" y2="38" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" />
                        <stop offset="1" stopColor="#1F2346" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="paint1_linear_679_10664" x1="0.5" y1="38" x2="52.5" y2="38" gradientUnits="userSpaceOnUse">
                        <stop stopColor="white" />
                        <stop offset="0.900442" stopColor="white" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
};

export default memo(ChipControlPanel);
