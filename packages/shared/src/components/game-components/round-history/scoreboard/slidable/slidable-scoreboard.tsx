import { Component, ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

export type SlidableScoreboardProps = { boards: ReactNode[] };

export class SlidableScoreboard extends Component<SlidableScoreboardProps> {
    render(): ReactNode {
        const { boards } = this.props;
        return (
            <Swiper
                slidesPerView={"auto"}
                navigation={true}
                modules={[Navigation]}
                spaceBetween={8}
                className="swiper-scoreboard relative overflow-hidden"
                noSwiping={false}
            >
                {boards.map((board, key) => (
                    <SwiperSlide key={key}>{board}</SwiperSlide>
                ))}
            </Swiper>
        );
    }
}
