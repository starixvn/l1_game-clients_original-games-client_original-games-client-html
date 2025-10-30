import { ReactNode, memo, useRef, useEffect } from "react";
import { Round } from '@shared/components/game-base/type';
import { SwitchableScoreboard, SlidableScoreboard } from '@shared/components/game-components/round-history/scoreboard';
import {
    BaccaratBigRoadConverter,
    BaccaratBigRoadElement,
    BaccaratBeadRoadCharacterElement,
    BaccaratBeadRoadCharacterElementWithTranslator,
} from "./scoreboard-elements";
import Styles from "./scoreboard.module.scss";
import { BaccaratResult, BaccaratSettlementResult } from "../baccarat-multiplayer-constants";
import { cn } from "@shared/utils";
import { hasPlayerPair, hasBankerPair, hasNatural } from './utils';
import { Swiper as SwiperType } from 'swiper';

export type ScoreboardComponentProps = {
    roundHistory: Round<BaccaratResult, BaccaratSettlementResult>[];
    isShowBlink: boolean;
    playResultAnimation?: boolean;
    onSwiperReady?: (swiper: SwiperType) => void;
    onSlideChange?: (swiper: SwiperType) => void;
};

const ScoreboardBaccarat: React.FC<ScoreboardComponentProps> = ({ roundHistory, isShowBlink, playResultAnimation, onSwiperReady, onSlideChange }) => {
    const scoreboardColumnsRef = useRef(17);
    const scrollTriggerRef = useRef(0);

    const updateScoreboardColumns = (actualColumns: number) => {
        scoreboardColumnsRef.current = actualColumns;
    };

    useEffect(() => {
        scrollTriggerRef.current = Date.now();
    }, [roundHistory]);

    const renderBigRoad = (): ReactNode => {
        const settlements = [...roundHistory].map((round) => ({
            ...round.settlementResult,
            natural: round.result ? hasNatural(round.result) : false,
            playerPair: round.result ? hasPlayerPair(round.result.player) : false,
            bankerPair: round.result ? hasBankerPair(round.result.banker) : false,
        }));

        if (isShowBlink) {
            BaccaratBigRoadConverter.addBlinkNode(settlements);
        }

        return (
            <div className={cn(Styles["scoreboard-full"], "py-1 px-[2px]")} id="big-road">
                <SwitchableScoreboard
                    key={`big-road-${scrollTriggerRef.current}`}
                    rounds={settlements as any}
                    scoreboards={[
                        {
                            element: BaccaratBigRoadElement,
                            arrange: BaccaratBigRoadElement.arrange(BaccaratBigRoadConverter.instance),
                            column: scoreboardColumnsRef.current,
                            row: 6,
                            updateScoreboardColumns: updateScoreboardColumns,
                            className: Styles["big-bead-road-override"],
                            blockClassName: Styles["big-bead-road-block"],
                            elementClassName: Styles["big-bead-road-item"],
                            scrollToRight: playResultAnimation,
                            columnWidth: 16
                        },
                    ]}
                />
            </div>
        );
    };

    const renderBeadRoad = (): ReactNode => {
        const rounds = isShowBlink ? [{}, ...roundHistory] : roundHistory;

        return (
            <div className={cn(Styles["scoreboard-full-bead-road"], "py-1 px-0")} id="bead-road">
                <SwitchableScoreboard
                    key={`bead-road-${scrollTriggerRef.current}`}
                    rounds={rounds}
                    scoreboards={[
                        {
                            element: BaccaratBeadRoadCharacterElementWithTranslator,
                            arrange: BaccaratBeadRoadCharacterElement.arrange,
                            column: scoreboardColumnsRef.current,
                            row: 6,
                            updateScoreboardColumns: updateScoreboardColumns,
                            className: Styles["big-bead-road-override"],
                            blockClassName: Styles["big-bead-road-block"],
                            elementClassName: Styles["big-bead-road-item"],
                            scrollToRight: playResultAnimation,
                            columnWidth: 16
                        },
                    ]}
                />
            </div>
        );
    };

    return (
        <SlidableScoreboard
            boards={[renderBigRoad(), renderBeadRoad()]}
            onSwiperReady={onSwiperReady}
            onSlideChange={onSlideChange}
        />
    );
};

export default memo(ScoreboardBaccarat);


