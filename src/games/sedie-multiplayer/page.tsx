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
import { tolgee } from "../../_shared/tolgee";
import GameBase from "../../components/game-base/";
import { GameMessageHandler } from "../../components/game-base/handlers";
import { GameBaseHandlers, GameBaseProps, GameBaseState, Round } from "../../components/game-base/type";
import RedAndBlueStatistic from "../../components/game-components/statistic/red-blue-statistic";
import { RoundGameSoundHandler } from "../../components/round-base/round-game-sound-handler";
import { RoundIdHandler } from "../../components/round-base/round-id-handler";
import { RoundStateHandler } from "../../components/round-base/round-state-handler";
import ScoreboardSeDie from "./scoreboard";
import { SeDieBetOptions } from "./sedie-multiplayer-constants";
import { SeDieGameRoundDataHandler } from "./sedie-multiplayer-game-round-data-handler";
import Styles from "./sedie-multiplayer.module.scss";
import SeBallStyle from "./sedie-multiplayer.module.scss";
import { SeDieResult, SeDieSettlementResult } from "./sedie-multiplayer-constants";
import { SedieMultiplayerRoundHistoryItem } from "./round-history/sedie-multiplayer-round-history-item";
import { Plate } from "./result-block";
import SeDieBettingBlock from "./sedie-multiplayer-betting-block";
import { SedieMultiplayerRoundHistory } from "./round-history/sedie-multiplayer-round-history";

const DrawIdBlock = dynamic(() => import("../../components/game-components/draw-id"));

export type SeDieState = {
    statisticGroup?: number;
} & GameBaseState;

class SeDieMultiPlayer extends GameBase<GameBaseProps, SeDieState> {
    state: SeDieState = { statisticGroup: 0, isLoaded: false };
    private readonly roundIdHandler?: RoundIdHandler;

    constructor(props: GameBaseProps) {
        const gameMessageHandler = new GameMessageHandler(props.dispatch);
        const gameBaseHandlers: GameBaseHandlers = {
            roundStateHandler: new RoundStateHandler(),
            gameMessageHandler: gameMessageHandler,
            gameRoundDataHandler: new SeDieGameRoundDataHandler(),
            gameSoundHandler: new RoundGameSoundHandler({ gameSound: () => props.gameSound }),
        };
        super(props, gameBaseHandlers);

        this.roundIdHandler = new RoundIdHandler({
            dispatch: props.dispatch,
            gameStateContextModel: this.getGameStateContext.bind(this),
            gameMessageHandler,
            durations: props.durations,
            pfSeedBy: "roundId",
        });
    }

    override registerHandlers(): void {
        super.registerHandlers();
        this.roundIdHandler?.registerEvents();
    }

    componentDidMount() {
        super.componentDidMount();
    }

    renderRoundHistory(): JSX.Element {
        return <SedieMultiplayerRoundHistory />;
    }

    renderLeftSideBetSettings() {
        return <div>x2</div>;
    }
    renderRightSideBetSettings() {
        return <div>A</div>;
    }

    renderResultBlock() {
        const { roundHistory, result, roundState, roundData, drawId, playResultAnimation, isPlayStartRoundAnimation, roundId } =
            this.props.gameStateContextModel;

        return (
            <Plate {...{ roundHistory, result, roundState, roundData, drawId, playResultAnimation, isPlayStartRoundAnimation, roundId }} />
        );
    }

    renderBettingBlock() {
        return <SeDieBettingBlock />;
    }

    renderBetHistoryModal() {
        const SeDieBetHistoryModal = dynamic(() => import("./history"));
        return <SeDieBetHistoryModal />;
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;
        const locale = tolgee.getLanguage() ?? "en";
        const classNameIndo = locale === "id" ? SeBallStyle["statistic-indo"] : "";

        const subChoicesClass = {
            [SeDieBetOptions.RED2]: Styles[`statistic-${SeDieBetOptions.RED2}`],
            [SeDieBetOptions.RED3]: Styles[`statistic-${SeDieBetOptions.RED3}`],
            [SeDieBetOptions.RED4]: Styles[`statistic-${SeDieBetOptions.RED4}`],
            [SeDieBetOptions.WHITE3]: Styles[`statistic-${SeDieBetOptions.WHITE3}`] ?? Styles[`statistic-blue3`],
            [SeDieBetOptions.WHITE4]: Styles[`statistic-${SeDieBetOptions.WHITE4}`] ?? Styles[`statistic-blue4`],
        };

        return (
            <RedAndBlueStatistic
                roundHistory={roundHistory}
                mainChoices={[SeDieBetOptions.ODD, SeDieBetOptions.EVEN]}
                className={classNameIndo}
                subChoices={[
                    SeDieBetOptions.RED2,
                    SeDieBetOptions.RED3,
                    SeDieBetOptions.RED4,
                    SeDieBetOptions.WHITE3,
                    SeDieBetOptions.WHITE4,
                ]}
                subChoicesClass={subChoicesClass}
            />
        );
    }

    renderScoreboards() {
        const { roundHistory, isShowBlink } = this.props.gameStateContextModel;
        const { statisticGroup } = this.state;

        return (
            <ScoreboardSeDie
                isShowBlink={isShowBlink}
                roundHistory={roundHistory as Round<SeDieResult, SeDieSettlementResult>[]}
                isOddEven={statisticGroup === 1}
            />
        );
    }

    renderRoundIdSection(): JSX.Element {
        return <DrawIdBlock showRoundId={true} />;
    }
}

const SeDieWrapper = (props) => {
    return (
        <GameStateProvider>
            <SeDieFC {...props} />
        </GameStateProvider>
    );
};

const SeDieFC = (props) => {
    const tolgeeNamespace = props["tolgeeNamespace"];
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <SeDieMultiPlayer
            {...props}
            {...{
                dispatch: useGameStatesDispatch(),
                gameStateContextModel: useGameStateContext(),
                systemContextModel: useSystemContext(),
                systemDispatch: useSystemDispatch(),
                translate: t,
                tolgeeNamespace,
                hedgeBetGroups: [[SeDieBetOptions.ODD, SeDieBetOptions.EVEN]],
            }}
        />
    );
};

export default withRouter(SeDieWrapper);
