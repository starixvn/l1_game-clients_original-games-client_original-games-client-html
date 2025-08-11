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
import { GameStatusMap } from "../../components/game-components/countdown-timer/countdown-timer";
import RedAndBlueStatistic from "../../components/game-components/statistic/red-blue-statistic";
import { RoundGameSoundHandler } from "../../components/round-base/round-game-sound-handler";
import { RoundIdHandler } from "../../components/round-base/round-id-handler";
import { RoundStateHandler } from "../../components/round-base/round-state-handler";
import { SeDieBettingBlock, SeDieResultBlock } from ".";
import { SeDieBetOptions } from "./sedie-constants";
import { SeDieGameRoundDataHandler } from "./sedie-game-round-data-handler";
import Styles from "./sedie-multi-player.module.scss";
import { SeDieResult, SeDieSettlementResult } from "./sedie-constants";

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
            <SeDieResultBlock
                roundHistory={roundHistory as Round<SeDieResult, SeDieSettlementResult>[]}
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
        return <SeDieBettingBlock />;
    }

    renderBetHistoryModal() {
        return (
            <div className={Styles["bet-history-modal"]}>
                <div className={Styles["bet-history-header"]}>
                    <h3>Bet History</h3>
                    <button className={Styles["close-button"]}>×</button>
                </div>
                <div className={Styles["bet-history-content"]}>
                    <p>Bet history functionality will be implemented here.</p>
                </div>
            </div>
        );
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;
        const locale = tolgee.getLanguage() ?? "en";
        const classNameIndo = locale === "id" ? Styles["statistic-indo"] : "";

        const subChoicesClass = {
            [SeDieBetOptions.RED2]: Styles[`statistic-${SeDieBetOptions.RED2}`],
            [SeDieBetOptions.RED3]: Styles[`statistic-${SeDieBetOptions.RED3}`],
            [SeDieBetOptions.RED4]: Styles[`statistic-${SeDieBetOptions.RED4}`],
            [SeDieBetOptions.WHITE3]: Styles[`statistic-${SeDieBetOptions.WHITE3}`],
            [SeDieBetOptions.WHITE4]: Styles[`statistic-${SeDieBetOptions.WHITE4}`],
        };

        return (
            <div className={`${Styles.statistic} ${classNameIndo}`}>
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
            </div>
        );
    }

    renderGameStatus() {
        return GameStatusMap.RoundBaseStatus;
    }

    renderScoreboards() {
        return (
            <div className={Styles["scoreboards-container"]}>
                <div className={Styles["scoreboard-header"]}>
                    <h3>Game Statistics</h3>
                </div>
                <div className={Styles["scoreboard-content"]}>
                    <div className={Styles["scoreboard-item"]}>
                        <span className={Styles["scoreboard-label"]}>Total Rounds:</span>
                        <span className={Styles["scoreboard-value"]}>
                            {this.props.gameStateContextModel.roundHistory?.length || 0}
                        </span>
                    </div>
                    <div className={Styles["scoreboard-item"]}>
                        <span className={Styles["scoreboard-label"]}>Current Round:</span>
                        <span className={Styles["scoreboard-value"]}>
                            {this.props.gameStateContextModel.roundData?.drawId || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>
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
