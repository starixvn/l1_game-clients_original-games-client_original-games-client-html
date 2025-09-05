import { withRouter } from "next/router";
import { JSX } from "react";
import dynamic from "next/dynamic";

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
import SeDieMultiplayerBetDetailModal from "./history";
import { PlayerResultBoard } from "../../components/game-components/player-result-board/player-result-board";
const Background = dynamic(() => import("../../components/game-components/background"), { ssr: false });
const OwnTotalBet = dynamic(() => import("../../components/game-components/own-total-bet/own-total-bet"), { ssr: false });
const DoubleBetIcon = dynamic(() => import("../../components/game-components/rebet/double-bet-icon"), { ssr: false });
const AutoRebetIcon = dynamic(() => import("../../components/game-components/rebet/auto-rebet-icon"), { ssr: false });

class SeDieMultiPlayer extends GameBase<GameBaseProps, GameBaseState> {
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

    renderGameFrame() {
        return (
            <div className={`flex flex-col items-center justify-center relative md:min-h-[27.75rem]`}>
                <Background gameId={this.props.id} />
                {this.renderRoundHistory()}
                {this.renderCountdownTimer()}
                <div className="flex flex-col">
                    {this.props.gameStateContextModel.availableInGameData && this.renderResultBlock()}
                    {this.renderBetOptions()}
                </div>

                {this.renderNotice()}
            </div>
        );
    }

    renderRoundHistory(): JSX.Element {
        return <SedieMultiplayerRoundHistory />;
    }

    renderResultBlock() {
        return <SediePlate />;
    }

    renderBettingBlock() {
        return <SeDieMultiplayerBettingBlock />;
    }

    renderBetControl() {
        return (
            <div className="relative md:bg-primary-bg md:rounded-t-xl">
                <div className="grid grid-cols-12 gap-0 items-center">
                    <div className="col-span-12 md:col-span-6">
                        <div className="flex gap-2 justify-center items-center">
                            <div className="md:absolute md:right-[10px] md:top-[-230px]">
                                <DoubleBetIcon />
                            </div>
                            {this.renderChipControlPanel()}
                            <div className="md:absolute md:right-[10px] md:top-[-164px] md:w-full md:h-full">
                                <div className="md:flex md:justify-end">
                                    <AutoRebetIcon />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-span-12 md:col-span-6">
                        <div className="p-3 rounded-t-xl bg-primary-bg">
                            <OwnTotalBet />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    renderRightSide() {
        return (
            <div className="col-span-12 lg:col-span-4 mb-3 px-3">
                <PlayerResultBoard />
            </div>
        );
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
                translate: t,
                tolgeeNamespace,
                hedgeBetGroups: [[SeDieBetOptions.ODD, SeDieBetOptions.EVEN]],
            }}
        />
    );
};

export default withRouter(SeDieWrapper);
