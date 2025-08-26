import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { useSelectChipSound } from "../../../_shared/react-hooks";
import { Chip } from "./chip";
import Styles from "./chip-slider.module.scss";
import { ChipInfo } from "sc-user-service-client/dist/setting";
import { useShallow } from "zustand/shallow";
import useBettingStore from "../../../_shared/stores/betting-store/betting-store";

const SlidingTimeInMillisecond = 100;
const slidesToShow = 5;

export const ChipSlider: React.FC<{
    chipValues: number[];
    onSelectChip: (chipValue: number) => void;
    chipSettings: ChipInfo[];
}> = ({ chipValues, onSelectChip, chipSettings }) => {
    const [selectedChip, setSelectedChip] = useBettingStore(useShallow((state) => [state.selectedChip, state.actions.setSelectedChip]));
    const [enabledPrevBtn, setEnabledPrevBtn] = useState(true);
    const [enabledNextBtn, setEnabledNextBtn] = useState(true);
    const [isSliding, setIsSliding] = useState(false);
    let sliderRef = null;
    const playClickChip = useSelectChipSound();

    const handleSelectChip = (chipValue: number) => {
        if (isSliding) {
            return;
        }
        if (selectedChip !== chipValue) {
            setSelectedChip(chipValue);
        }
        onSelectChip(chipValue);
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
        if (enabledNextBtn && !isSliding) {
            sliderRef.slickNext();
            disableSelectChipWhenSliding();
        }
    };

    const onClickPrev = () => {
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
            <div
                id="icon-chip-slider-pre"
                className={`${Styles["icon-prev"]} ${!enabledPrevBtn && Styles["disabled"]}`}
                onClick={onClickPrev}
            >
                <svg width="16" height="22" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g filter="url(#filter0_d_1503_7573)">
                        <path
                            d="M10.2936 4.76937C10.703 4.39235 11.3445 4.41365 11.7269 4.81723C12.1092 5.22074 12.0875 5.85329 11.6784 6.23035L6.49903 11L11.6784 15.7697C12.0875 16.1467 12.1092 16.7793 11.7269 17.1828C11.3445 17.5864 10.703 17.6077 10.2936 17.2306L4.32191 11.7305C4.11667 11.5414 4 11.277 4 11C4 10.723 4.11667 10.4586 4.32191 10.2695L10.2936 4.76937Z"
                            fill="white"
                        />
                    </g>
                </svg>
            </div>
            <div className="absolute w-[270px]">
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
                                className="mx-2"
                            />
                        ))}
                    </Slider>
                )}
            </div>
            <div
                id="icon-chip-slider-next"
                className={`${Styles["icon-next"]} ${!enabledNextBtn && Styles["disabled"]}`}
                onClick={onClickNext}
            >
                <svg width="16" height="22" viewBox="0 0 16 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g filter="url(#filter0_d_1503_7695)">
                        <path
                            d="M5.70636 4.76937C5.29702 4.39235 4.65551 4.41365 4.27311 4.81723C3.89078 5.22074 3.91253 5.85329 4.32164 6.23035L9.50097 11L4.32164 15.7697C3.91253 16.1467 3.89078 16.7793 4.27311 17.1828C4.65551 17.5864 5.29702 17.6077 5.70636 17.2306L11.6781 11.7305C11.8833 11.5414 12 11.277 12 11C12 10.723 11.8833 10.4586 11.6781 10.2695L5.70636 4.76937Z"
                            fill="white"
                        />
                    </g>
                </svg>
            </div>
        </>
    );
};
