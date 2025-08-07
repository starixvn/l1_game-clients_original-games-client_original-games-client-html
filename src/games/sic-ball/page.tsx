import dynamic from "next/dynamic";
import { withRouter } from "next/router";
import { JSX } from "react";

import { useSystemContext, useSystemDispatch } from "../../_shared/react-contexts";
import {
    GameStateProvider,
    useGameStateContext,
    useGameStatesDispatch,
} from "../../_shared/react-contexts/game-state-context/game-state-context";
import { useTranslator } from "../../_shared/react-hooks";
import GameBase from "../../components/game-base/";
import { GameMessageHandler } from "../../components/game-base/handlers";
import { GameBaseHandlers, GameBaseProps, GameBaseState, Round } from "../../components/game-base/type";
import { GameStatusMap } from "../../components/game-components/countdown-timer/countdown-timer";
import { RoundGameSoundHandler } from "../../components/round-base/round-game-sound-handler";
import { RoundStateHandler } from "../../components/round-base/round-state-handler";
import { SicBallBetOptions } from "./sic-ball-constants";
import { NextGameRoundDataHandler } from "./sic-ball-game-round-data-handler";
import Styles from "./sic-ball.module.scss";
import { SicBallResult, SicBallSettlementResult } from "./types";
import { RoundIdHandler } from "../../components/round-base/round-id-handler";
import SicBallResultBlock from "./sic-ball-result-block";
import ScoreboardSicBall from "./scoreboard";
import SicBallBettingBlock from "./sic-ball-betting-block";
import RedAndBlueStatisticSubRoundCounter from "../../components/game-components/statistic/red-blue-statistic-sub-round-counter";
import SideBetScoreboardContainer from "../../components/game-components/round-history/side-bet-scoreboard/side-bet-scoreboard-container";
import SicBallStatisticSideBetDetail from "./sic-ball-statistic-side-bet-detail";

const DrawIdBlock = dynamic(() => import("../../components/game-components/draw-id"));
const SicBallBetHistoryModal = dynamic(() => import("./history"));

export type SicBallState = {
    statisticGroup?: number;
} & GameBaseState;

class SicBall extends GameBase<GameBaseProps, SicBallState> {
    state: SicBallState = { statisticGroup: 0, isLoaded: false };
    private readonly roundIdHandler?: RoundIdHandler;
    constructor(props: GameBaseProps) {
        const gameMessageHandler = new GameMessageHandler(props.dispatch);
        const gameBaseHandlers: GameBaseHandlers = {
            roundStateHandler: new RoundStateHandler(),
            gameMessageHandler: gameMessageHandler,
            gameRoundDataHandler: new NextGameRoundDataHandler(),
            gameSoundHandler: new RoundGameSoundHandler({ gameSound: () => props.gameSound }),
        };
        super(props, gameBaseHandlers);

        this.roundIdHandler = new RoundIdHandler({
            dispatch: props.dispatch,
            gameStateContextModel: this.getGameStateContext.bind(this),
            gameMessageHandler,
            durations: props.durations,
        });
    }

    override registerHandlers(): void {
        super.registerHandlers();

        this.roundIdHandler?.registerEvents();
    }

    componentDidMount() {
        super.componentDidMount();
    }

    renderResultBlock() {
        const { roundHistory, result, roundState, roundData, drawId, playResultAnimation, isPlayStartRoundAnimation } =
            this.props.gameStateContextModel;

        return (
            <SicBallResultBlock
                roundHistory={roundHistory as Round<SicBallResult, SicBallSettlementResult>[]}
                result={result}
                roundState={roundState}
                roundData={roundData}
                drawId={drawId}
                playResultAnimation={playResultAnimation}
                isPlayStartRoundAnimation={isPlayStartRoundAnimation}
            />
        );
    }

    renderBettingBlock() {
        return <SicBallBettingBlock />;
    }

    renderBetHistoryModal() {
        return <SicBallBetHistoryModal />;
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;

        const subChoicesClass = {
            [SicBallBetOptions.SPECIFIC1]: Styles[`statistic-${SicBallBetOptions.SPECIFIC1}`],
            [SicBallBetOptions.SPECIFIC2]: Styles[`statistic-${SicBallBetOptions.SPECIFIC2}`],
            [SicBallBetOptions.SPECIFIC3]: Styles[`statistic-${SicBallBetOptions.SPECIFIC3}`],
            [SicBallBetOptions.SPECIFIC4]: Styles[`statistic-${SicBallBetOptions.SPECIFIC4}`],
            [SicBallBetOptions.SPECIFIC5]: Styles[`statistic-${SicBallBetOptions.SPECIFIC5}`],
            [SicBallBetOptions.SPECIFIC6]: Styles[`statistic-${SicBallBetOptions.SPECIFIC6}`],
        };

        return (
            <RedAndBlueStatisticSubRoundCounter
                roundHistory={roundHistory}
                mainChoices={[SicBallBetOptions.BIG, SicBallBetOptions.SMALL]}
                subChoices={[
                    SicBallBetOptions.SPECIFIC1,
                    SicBallBetOptions.SPECIFIC2,
                    SicBallBetOptions.SPECIFIC3,
                    SicBallBetOptions.SPECIFIC4,
                    SicBallBetOptions.SPECIFIC5,
                    SicBallBetOptions.SPECIFIC6,
                ]}
                subChoicesClass={subChoicesClass}
            />
        );
    }

    renderGameStatus() {
        return GameStatusMap.RoundBaseStatus;
    }

    renderScoreboards() {
        const { roundHistory, isShowBlink } = this.props.gameStateContextModel;
        const { statisticGroup } = this.state;

        return (
            <ScoreboardSicBall
                isShowBlink={isShowBlink}
                roundHistory={roundHistory as Round<SicBallResult, SicBallSettlementResult>[]}
                isBigSmall={statisticGroup === 1}
            />
        );
    }

    renderRoundIdSection(): JSX.Element {
        return <DrawIdBlock showRoundId={true} />;
    }

    renderStatisticContent() {
        const { roundHistory } = this.props.gameStateContextModel;

        return <SideBetScoreboardContainer roundHistory={roundHistory.slice(0, 30)} getDotDetails={SicBallStatisticSideBetDetail} />;
    }
}

const SicBallWrapper = (props) => {
    return (
        <GameStateProvider>
            <SicBallFC {...props} />
        </GameStateProvider>
    );
};

const SicBallFC = (props) => {
    const tolgeeNamespace = props["tolgeeNamespace"];
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <SicBall
            {...props}
            {...{
                dispatch: useGameStatesDispatch(),
                gameStateContextModel: useGameStateContext(),
                systemContextModel: useSystemContext(),
                systemDispatch: useSystemDispatch(),
                translate: t,
                tolgeeNamespace,
                hedgeBetGroups: [[SicBallBetOptions.BIG, SicBallBetOptions.SMALL]],
            }}
        />
    );
};

export default withRouter(SicBallWrapper);
