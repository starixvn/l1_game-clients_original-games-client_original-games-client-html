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
import { GameMessageHandler, messageEventType } from "../../components/game-base/handlers";
import { GameBaseHandlers, GameBaseProps, GameBaseState, Round } from "../../components/game-base/type";
import { GameStatusMap } from "../../components/game-components/countdown-timer/countdown-timer";
import RedAndBlueStatistic from "../../components/game-components/statistic/red-blue-statistic";
import { RoundGameSoundHandler } from "../../components/round-base/round-game-sound-handler";
import { RoundIdHandler } from "../../components/round-base/round-id-handler";
import { RoundStateHandler } from "../../components/round-base/round-state-handler";
import SeDieBettingBlock from "./sedie-betting-block";
import { SeDieBetOptions } from "./sedie-constants";
import SeDieResultBlock from "./sedie-result-block";
import SeDieWinningAnimation from "./sedie-winning-animation";
import Styles from "./sedie-multi-player.module.scss";
import { SeDieResult, SeDieSettlementResult } from "./sedie-constants";

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

    handlePlaceBet(betChoice: string, amount: number, freeBet: boolean = false) {
        // Handle bet placement logic
        console.log(`Placing bet: ${betChoice}, amount: ${amount}, freeBet: ${freeBet}`);

        // Here you would typically:
        // 1. Validate the bet
        // 2. Send bet to the game service
        // 3. Update local state
        // 4. Handle any errors

        // Send bet message through the game message handler
        this.props.gameMessageHandler?.broadcastGameEvent?.({
            [messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED]: {
                event: "bet",
                data: { betChoices: { [betChoice.toLowerCase()]: amount } }
            }
        });
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
        const { roundState } = this.props.gameStateContextModel;
        return (
            <SeDieBettingBlock
                onBet={this.handlePlaceBet.bind(this)}
                roundState={roundState}
                userStakeLevel={this.props.userStakeLevel}
            />
        );
    }

    renderBetHistoryModal() {
        return null; // SeDie doesn't have bet history modal yet
    }

    renderStatistic() {
        const { roundHistory } = this.props.gameStateContextModel;
        const locale = tolgee.getLanguage() ?? "en";
        const classNameIndo = locale === "id" ? Styles["statistic-indo"] : "";

        return (
            <div className={`${Styles.statistic} ${classNameIndo}`}>
                <RedAndBlueStatistic
                    roundHistory={roundHistory}
                    statisticGroup={this.state.statisticGroup}
                    onStatisticGroupChange={(group) => this.setState({ statisticGroup: group })}
                />
            </div>
        );
    }

    renderGameStatus() {
        return null; // SeDie doesn't have game status yet
    }

    renderScoreboards() {
        return null; // SeDie doesn't have scoreboards yet
    }

    renderRoundIdSection(): JSX.Element {
        return <></>; // SeDie doesn't have round ID section yet
    }

    render() {
        const { gameStateContextModel } = this.props;
        const { roundState, result, settlementResult, playResultAnimation, isPlayStartRoundAnimation } = gameStateContextModel;

        return (
            <div className={Styles["sedie-game-container"]}>
                <div className={Styles["game-header"]}>
                    <h1>SeDie Multi-Player</h1>
                    <div className={Styles["game-info"]}>
                        <span>Game ID: {this.props.id}</span>
                        <span>Namespace: {this.props.socketInfo?.namespace}</span>
                    </div>
                </div>

                <div className={Styles["game-content"]}>
                    {this.renderBettingBlock()}
                    {this.renderResultBlock()}

                    {result && (
                        <SeDieWinningAnimation
                            choice={result.winningChoice || ""}
                            resourceName={result.winningChoice || ""}
                            roundState={roundState}
                            settlementResult={settlementResult}
                            showResultInfo={true}
                        />
                    )}
                </div>

                <div className={Styles["game-footer"]}>
                    <div className={Styles["round-info"]}>
                        <span>Round State: {roundState}</span>
                        {result && (
                            <span>Draw ID: {result.drawId}</span>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

// Proper game round data handler for SeDie
class SeDieGameRoundDataHandler {
    constructor() {
        // Initialize any necessary data structures
    }

    // Handle game round data updates
    handleRoundDataUpdate(roundData: any) {
        // Process round data updates
        return roundData;
    }

    // Handle bet placement
    handleBetPlacement(betData: any) {
        // Process bet placement
        return betData;
    }

    // Handle round settlement
    handleRoundSettlement(settlementData: any) {
        // Process round settlement
        return settlementData;
    }
}

const SeDieWrapper = (props) => {
    const systemContext = useSystemContext();
    const systemDispatch = useSystemDispatch();

    return (
        <GameStateProvider>
            <SeDieMultiPlayer {...props} systemContextModel={systemContext} systemDispatch={systemDispatch} />
        </GameStateProvider>
    );
};

const SeDieFC = (props) => {
    const gameStateContext = useGameStateContext();
    const gameStatesDispatch = useGameStatesDispatch();
    const translate = useTranslator();

    return (
        <SeDieWrapper
            {...props}
            dispatch={gameStatesDispatch}
            gameStateContextModel={gameStateContext}
            translate={translate}
        />
    );
};

export default withRouter(SeDieFC);
