import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { useClickSound, useSelectChipSound } from "../../../_shared/react-hooks";
import { Chip } from "./chip";
import Styles from "./chip-slider.module.scss";
import { ChipInfo } from "sc-user-service-client/dist/setting";
import { useShallow } from "zustand/shallow";
import useBettingStore from "../../../_shared/stores/betting-store/betting-store";

const SlidingTimeInMillisecond = 100;
const slidesToShow = 5;

export const ChipSlider: React.FC<{
    chipValues: number[];
    chipSettings: ChipInfo[];
    onSelectChip?: (chipValue: number) => void;
    isHideIcons?: boolean;
}> = ({ chipValues, onSelectChip, chipSettings, isHideIcons = false }) => {
    const [selectedChip, setSelectedChip] = useBettingStore(useShallow((state) => [state.selectedChip, state.actions.setSelectedChip]));
    const [enabledPrevBtn, setEnabledPrevBtn] = useState(true);
    const [enabledNextBtn, setEnabledNextBtn] = useState(true);
    const [isSliding, setIsSliding] = useState(false);
    let sliderRef = null;
    const playClickChip = useSelectChipSound();
    const soundClick = useClickSound();

    const handleSelectChip = (chipValue: number) => {
        if (isSliding) {
            return;
        }
        if (selectedChip !== chipValue) {
            setSelectedChip(chipValue);
        }
        onSelectChip?.(chipValue);
        playClickChip();
    };

    const disableSelectChipWhenSliding = () => {
        setIsSliding(true);

        const slidingTimeOut = setTimeout(() => {
            setIsSliding(false);
            clearTimeout(slidingTimeOut);
        }, SlidingTimeInMillisecond);
    };

    const onClickNext = () => {
        soundClick();
        if (enabledNextBtn && !isSliding) {
            sliderRef.slickNext();
            disableSelectChipWhenSliding();
        }
    };

    const onClickPrev = () => {
        soundClick();
        if (enabledPrevBtn && !isSliding) {
            sliderRef.slickPrev();
            disableSelectChipWhenSliding();
        }
    };

    const checkStatusButtons = (index: number) => {
        setEnabledPrevBtn(index > 0 && chipValues.length > slidesToShow);
        setEnabledNextBtn(index < chipValues.length - slidesToShow);
    };

    useEffect(() => {
        if (sliderRef) {
            let chipIndex = chipValues.indexOf(selectedChip);
            if (chipValues.length > slidesToShow && chipIndex >= chipValues.length - slidesToShow) {
                chipIndex = chipValues.length - slidesToShow;
            }
            sliderRef.slickGoTo(chipIndex);
            checkStatusButtons(chipIndex);
        }
    }, [selectedChip]);

    const findChipSetting = (value) => {
        return chipSettings?.find((c) => c.value === value);
    };

    const onAfterChange = (current) => {
        checkStatusButtons(current);
        setIsSliding(false);
    };

    const SliderSetting = {
        speed: SlidingTimeInMillisecond,
        infinite: false,
        adaptiveHeight: true,
        swipeToSlide: true,
        slidesToShow: slidesToShow > chipValues.length ? chipValues.length : slidesToShow,
        slidesToScroll: 1,
        arrows: false,
        onSwipe: () => {
            setIsSliding(true);
        },
        afterChange: (current) => {
            onAfterChange(current);
        },
    };

    return (
        <>
            {!isHideIcons && (
                <div
                    id="icon-chip-slider-pre"
                    className={`${Styles["icon-prev"]} ${!enabledPrevBtn && Styles["disabled"]}`}
                    onClick={onClickPrev}
                >
                    <i className="icon-back text-xl"></i>
                </div>
            )}
            <div className="absolute w-[270px] md:w-full">
                {chipValues?.length > 0 && (
                    <Slider
                        ref={(c) => {
                            sliderRef = c;
                        }}
                        {...SliderSetting}
                    >
                        {chipValues.map((value) => (
                            <Chip
                                key={+value}
                                value={+value}
                                text={findChipSetting(value)?.text}
                                color={findChipSetting(value)?.color}
                                onClickChip={handleSelectChip}
                            />
                        ))}
                    </Slider>
                )}
            </div>
            {!isHideIcons && (
                <div
                    id="icon-chip-slider-next"
                    className={`${Styles["icon-next"]} ${!enabledNextBtn && Styles["disabled"]}`}
                    onClick={onClickNext}
                >
                    <i className="icon-back text-xl rotate-180"></i>
                </div>
            )}
        </>
    );
};
