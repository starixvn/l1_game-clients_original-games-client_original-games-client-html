import { Component, ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperType } from 'swiper';

export type SlidableScoreboardProps = {
    boards: ReactNode[];
    onSwiperReady?: (swiper: SwiperType) => void;
};

export class SlidableScoreboard extends Component<SlidableScoreboardProps> {
    render(): ReactNode {
        const { boards, onSwiperReady } = this.props;
        return (
            <Swiper
                onSwiper={onSwiperReady}
                slidesPerView="auto"
                spaceBetween={12}
                className="swiper-scoreboard relative overflow-hidden"
                allowTouchMove={false}
                speed={500}
            >
                {boards.map((board, key) => (
                    <SwiperSlide key={key}>{board}</SwiperSlide>
                ))}
            </Swiper>
        );
    }
}

export default SlidableScoreboard;