import { withRouter } from "next/router";
import { JSX, lazy } from "react";

import GameBase from "@shared/components/game-base";
import { GameMessageHandler } from "@shared/components/game-base/handlers";
import { GameBaseHandlers, GameBaseProps, GameBaseState } from "@shared/components/game-base/type";
import { RoundGameSoundHandler } from "@shared/components/round-base/round-game-sound-handler";
import { RoundIdHandler } from "@shared/components/round-base/round-id-handler";
import { RoundStateHandler } from "@shared/components/round-base/round-state-handler";
import {
    GameStateProvider,
    useGameStateContext,
    useGameStatesDispatch,
} from "@shared/react-contexts/game-state-context/game-state-context";
import { useTranslator } from "@shared/react-hooks";
import { BaccaratGameRoundDataHandler } from "./baccarat-game-round-data-handler";

import { PlayerResultBoard } from "@shared/components/game-components/player-result-board/player-result-board";
import { BaccaratBetOptions } from "./baccarat-multiplayer-constants";
import BaccaratBettingBlock from "./betting-block/baccarat-betting-block";
import BaccaratMultiplayerBetDetailModal from "./history";
import BaccaratSettlementResult from "./result-block/baccarat-settlement-result";
import { BaccaratMultiplayerRoundHistory } from "./round-history/baccarat-multiplayer-round-history";
const OwnTotalBet = lazy(() => import("@shared/components/game-components/own-total-bet/own-total-bet"));
const DoubleBetIcon = lazy(() => import("@shared/components/game-components/rebet/double-bet-icon"));
const AutoRebetIcon = lazy(() => import("@shared/components/game-components/rebet/auto-rebet-icon"));

class Baccarat extends GameBase<GameBaseProps, GameBaseState> {
    private readonly roundIdHandler?: RoundIdHandler;
    constructor(props: GameBaseProps) {
        console.log("[Baccarat Page] Constructor called with props:", {
            gameId: props.id,
            gameName: props.gameName,
            openGameId: props.id,
        });

        const gameMessageHandler = new GameMessageHandler(props.dispatch);
        const handlers: GameBaseHandlers = {
            roundStateHandler: new RoundStateHandler(),
            gameMessageHandler,
            gameRoundDataHandler: new BaccaratGameRoundDataHandler(),
            gameSoundHandler: new RoundGameSoundHandler({ gameSound: () => props.gameSound }),
        };
        super(props, handlers);

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

    renderRoundHistory(): JSX.Element {
        return <BaccaratMultiplayerRoundHistory />;
    }
    renderResultBlock(): JSX.Element {
        return <BaccaratSettlementResult />;
    }
    renderBettingBlock(): JSX.Element {
        return <BaccaratBettingBlock />;
    }

    renderBetControl() {
        return (
            <div className="relative md:bg-primary-bg md:rounded-t-xl">
                <div className="grid grid-cols-12 gap-0 items-center">
                    <div className="col-span-12 md:col-span-6">
                        <div className="flex gap-2 justify-center items-center">
                            <div className="md:absolute md:right-[10px] md:top-[-200px]">
                                <DoubleBetIcon />
                            </div>
                            {this.renderChipControlPanel()}
                            <div className="md:absolute md:right-[10px] md:top-[-134px] md:w-full md:h-full">
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
        return <BaccaratMultiplayerBetDetailModal />;
    }
}

const BaccaratFC = (props: any) => {
    const tolgeeNamespace = props["tolgeeNamespace"];
    const { t } = useTranslator([tolgeeNamespace]);
    return (
        <Baccarat
            {...props}
            {...{
                dispatch: useGameStatesDispatch(),
                gameStateContextModel: useGameStateContext(),
                translate: t,
                tolgeeNamespace,
                hedgeBetGroups: [[BaccaratBetOptions.PLAYER, BaccaratBetOptions.BANKER]],
            }}
        />
    );
};

const BaccaratWrapper = (props: any) => (
    <GameStateProvider>
        <BaccaratFC {...props} />
    </GameStateProvider>
);

export default withRouter(BaccaratWrapper);
