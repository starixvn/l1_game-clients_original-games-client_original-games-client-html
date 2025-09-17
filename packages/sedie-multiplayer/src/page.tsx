import { withRouter } from "next/router";
import { JSX } from "react";
import dynamic from "next/dynamic";

import {
    GameStateProvider,
    useGameStateContext,
    useGameStatesDispatch,
} from "@shared/react-contexts/game-state-context/game-state-context";
import { useTranslator } from "@shared/react-hooks";
import GameBase from "@shared/components/game-base/";
import { GameMessageHandler } from "@shared/components/game-base/handlers";
import { GameBaseHandlers, GameBaseProps, GameBaseState } from "@shared/components/game-base/type";
import { RoundGameSoundHandler } from "@shared/components/round-base/round-game-sound-handler";
import { RoundIdHandler } from "@shared/components/round-base/round-id-handler";
import { RoundStateHandler } from "@shared/components/round-base/round-state-handler";
import { SeDieBetOptions } from "./sedie-multiplayer-constants";
import { SeDieGameRoundDataHandler } from "./sedie-multiplayer-game-round-data-handler";
import SedieCup from "./result-block/sedie-cup";
import SeDieMultiplayerBettingBlock from "./sedie-multiplayer-betting-block";
import { SedieMultiplayerRoundHistory } from "./round-history/sedie-multiplayer-round-history";
import SeDieMultiplayerBetDetailModal from "./history";
import { PlayerResultBoard } from "@shared/components/game-components/player-result-board/player-result-board";
const Background = dynamic(() => import("@shared/components/game-components/background"), { ssr: false });
const OwnTotalBet = dynamic(() => import("@shared/components/game-components/own-total-bet/own-total-bet"), { ssr: false });
const DoubleBetIcon = dynamic(() => import("@shared/components/game-components/rebet/double-bet-icon"), { ssr: false });
const AutoRebetIcon = dynamic(() => import("@shared/components/game-components/rebet/auto-rebet-icon"), { ssr: false });
const PFIcon = dynamic(() => import("@shared/components/game-components/menu/icons/pf"), { ssr: false });

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
            <div className={`flex flex-col items-center justify-center relative`}>
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
        return <SedieCup />;
    }

    renderBettingBlock() {
        return <SeDieMultiplayerBettingBlock />;
    }

    renderBetControl() {
        return (
            <>
                <div className="flex gap-6 justify-center items-center md:gap-3 mb-3 md:mb-0">
                    <DoubleBetIcon />
                    {this.renderChipControlPanel()}
                    <AutoRebetIcon />
                </div>
                
                    <div className="p-3 bg-primary-bg mx-3 border-stroke rounded-b-none before:rounded-b-none">
                        <OwnTotalBet />
                    </div>
                
            </>
        );
    }

    renderMoreMenuIcon() {
        return <PFIcon />;
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
