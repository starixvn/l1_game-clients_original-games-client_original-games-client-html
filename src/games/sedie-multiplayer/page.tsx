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
import { GameBaseHandlers, GameBaseProps, GameBaseState } from "../../components/game-base/type";
import { RoundGameSoundHandler } from "../../components/round-base/round-game-sound-handler";
import { RoundIdHandler } from "../../components/round-base/round-id-handler";
import { RoundStateHandler } from "../../components/round-base/round-state-handler";
import { SeDieBetOptions } from "./sedie-multiplayer-constants";
import { SeDieGameRoundDataHandler } from "./sedie-multiplayer-game-round-data-handler";
import SediePlate from "./result-block/sedie-plate";
import SeDieMultiplayerBettingBlock from "./sedie-multiplayer-betting-block";
import { SedieMultiplayerRoundHistory } from "./round-history/sedie-multiplayer-round-history";
import { SedieMultiplayerStatisticPopup } from "./round-history/sedie-multiplayer-statistic-popup";
// Animations handled inside statistic popup component
import SeDieMultiplayerBetDetailModal from "./history";

export type SeDieState = {
    statisticGroup?: number;
    showStatistic?: boolean;
} & GameBaseState;

class SeDieMultiPlayer extends GameBase<GameBaseProps, SeDieState> {
    state: SeDieState = { statisticGroup: 0, isLoaded: false, showStatistic: false };
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

    private readonly openStatistic = () => this.setState({ showStatistic: true });

    private readonly closeStatistic = () => this.setState({ showStatistic: false });

    renderRoundHistory(): JSX.Element {
        const { showStatistic } = this.state;
        return showStatistic ? (
            <div className="my-3">
                <SedieMultiplayerStatisticPopup inline onClose={this.closeStatistic} />
            </div>
        ) : (
            <SedieMultiplayerRoundHistory onOpenStatistic={this.openStatistic} />
        );
    }

    renderResultBlock() {
        return <SediePlate />;
    }

    renderBettingBlock() {
        return <SeDieMultiplayerBettingBlock />;
    }

    renderBetDetailModal() {
        return <SeDieMultiplayerBetDetailModal />;
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
