import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import { useSelectChipSound } from "../../../_shared/react-hooks";
import { Chip } from "./chip";
import Styles from "./chip-slider.module.scss";
import { ChipInfo } from "sc-user-service-client/dist/setting";

const SlidingTimeInMillisecond = 100;
const slidesToShow = 5;
let isSwipe = true;

export const ChipSlider: React.FC<{
    chipValues: number[];
    selectedChip: number;
    onSelectChip: (chipValue: number) => void;
    chipSettings: ChipInfo[];
}> = ({ chipValues, selectedChip, onSelectChip, chipSettings }) => {
    const [enabledPrevBtn, setEnabledPrevBtn] = useState(false);
    const [enabledNextBtn, setEnabledNextBtn] = useState(true);

    const [isSliding, setIsSliding] = useState(false);
    let sliderRef = null;
    const playClickChip = useSelectChipSound();

    const onClickChip = (chipValue: number) => {
        const chipIndex = chipValues.indexOf(chipValue);
        const currentSlide = sliderRef.innerSlider.state.currentSlide;

        if (chipIndex + 1 - slidesToShow >= currentSlide && slidesToShow < chipValues.length) {
            disableSelectChipWhenSliding();
            isSwipe = false;
            sliderRef.slickGoTo(chipIndex + 2 - slidesToShow);
        }

        if (chipIndex - 1 <= currentSlide && slidesToShow < chipValues.length) {
            disableSelectChipWhenSliding();
            isSwipe = false;
            sliderRef.slickGoTo(chipIndex - 1);
        }

        handleSelectChip(chipValue);
    };

    const handleSelectChip = (chipValue: number) => {
        onSelectChip(chipValue);
        playClickChip();
    };

    const updateArrowsByChipValue = (chipValue: number) => {
        const chipIndex = chipValues.indexOf(chipValue);

        chipIndex <= 0 ? setEnabledPrevBtn(false) : setEnabledPrevBtn(true);
        chipIndex === chipValues.length - 1 ? setEnabledNextBtn(false) : setEnabledNextBtn(true);
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
            const chipIndex = chipValues.indexOf(selectedChip);
            const newSelectedChip = chipValues[chipIndex + 1];

            isSwipe = false;
            slidesToShow < chipValues.length && sliderRef.slickGoTo(chipIndex + 3 - slidesToShow);
            handleSelectChip(newSelectedChip);
            disableSelectChipWhenSliding();
        }
    };

    const onClickPrev = () => {
        if (enabledPrevBtn && !isSliding) {
            const chipIndex = chipValues.indexOf(selectedChip);
            const newSelectedChip = chipValues[chipIndex - 1];

            isSwipe = false;
            slidesToShow < chipValues.length && sliderRef.slickGoTo(chipIndex - 2);
            handleSelectChip(newSelectedChip);
            disableSelectChipWhenSliding();
        }
    };

    useEffect(() => {
        if (sliderRef) {
            isSwipe = false;
            const chipIndex = chipValues.indexOf(selectedChip);
            sliderRef.slickGoTo(chipIndex);
            updateArrowsByChipValue(selectedChip);
        }
    }, [selectedChip]);

    const findChipSetting = (value) => {
        return chipSettings?.find((c) => c.value === value);
    };

    const SliderSetting = {
        speed: SlidingTimeInMillisecond,
        infinite: false,
        adaptiveHeight: true,
        swipeToSlide: true,
        slidesToShow: slidesToShow > chipValues.length ? chipValues.length : slidesToShow,
        arrows: false,
        onSwipe: () => {
            isSwipe = true;
        },
        beforeChange: (oldIndex: number, newIndex: number) => {
            if (isSwipe) {
                oldIndex > newIndex && handleSelectChip(chipValues[newIndex + slidesToShow - 1]);
                oldIndex < newIndex && handleSelectChip(chipValues[newIndex]);
            }
        },
    };

    return (
        <>
            <span
                id="icon-chip-slider-pre"
                className={`${Styles["icon-prev"]} ${!enabledPrevBtn && Styles["disabled"]}`}
                onClick={onClickPrev}
            ></span>
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
                            image={findChipSetting(value)?.color}
                            onClickChip={onClickChip}
                        />
                    ))}
                </Slider>
            )}
            <span
                id="icon-chip-slider-next"
                className={`${Styles["icon-next"]} ${!enabledNextBtn && Styles["disabled"]}`}
                onClick={onClickNext}
            ></span>
        </>
    );
};
