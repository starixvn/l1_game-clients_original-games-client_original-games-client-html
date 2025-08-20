import { Component, ReactNode } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

export type SlidableScoreboardProps = { boards: ReactNode[] };

export class SlidableScoreboard extends Component<SlidableScoreboardProps> {
    componentDidMount(): void {
        console.log("[SlidableScoreboard] componentDidMount - boards count:", this.props.boards.length);
        this.logDimensions();
    }

    componentDidUpdate(prevProps: SlidableScoreboardProps): void {
        if (prevProps.boards.length !== this.props.boards.length) {
            console.log("[SlidableScoreboard] componentDidUpdate - boards count changed from", prevProps.boards.length, "to", this.props.boards.length);
            this.logDimensions();
        }
    }

    private logDimensions(): void {
        // Log dimensions after a short delay to ensure DOM is ready
        setTimeout(() => {
            const swiperElement = document.querySelector('.swiper-scoreboard') as HTMLElement;
            if (swiperElement) {
                const rect = swiperElement.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(swiperElement);
                console.log("[SlidableScoreboard] Dimensions:", {
                    width: rect.width,
                    height: rect.height,
                    offsetWidth: swiperElement.offsetWidth,
                    offsetHeight: swiperElement.offsetHeight,
                    scrollWidth: swiperElement.scrollWidth,
                    scrollHeight: swiperElement.scrollHeight,
                    clientWidth: swiperElement.clientWidth,
                    clientHeight: swiperElement.clientHeight,
                    padding: computedStyle.padding,
                    margin: computedStyle.margin,
                    border: computedStyle.border
                });
            } else {
                console.log("[SlidableScoreboard] Swiper element not found");
            }
        }, 100);
    }

    render(): ReactNode {
        const { boards } = this.props;
        console.log("[SlidableScoreboard] render - boards count:", boards.length);

        return (
            <Swiper
                slidesPerView={"auto"}
                navigation={true}
                modules={[Navigation]}
                spaceBetween={8}
                className="swiper-scoreboard"
                noSwiping={false}
                onSwiper={(swiper) => {
                    console.log("[SlidableScoreboard] Swiper initialized:", {
                        slidesCount: swiper.slides.length,
                        slidesPerView: swiper.params.slidesPerView,
                        spaceBetween: swiper.params.spaceBetween,
                        width: swiper.width,
                        height: swiper.height
                    });
                }}
                onSlideChange={(swiper) => {
                    console.log("[SlidableScoreboard] Slide changed:", {
                        activeIndex: swiper.activeIndex,
                        realIndex: swiper.realIndex,
                        isBeginning: swiper.isBeginning,
                        isEnd: swiper.isEnd
                    });
                }}
            >
                {boards.map((board, key) => (
                    <SwiperSlide key={key} onLoad={() => {
                        console.log("[SlidableScoreboard] Slide loaded:", key);
                    }}>
                        {board}
                    </SwiperSlide>
                ))}
            </Swiper>
        );
    }
}
