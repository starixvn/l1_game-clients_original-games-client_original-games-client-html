import React, { JSX } from "react";
import dynamic from "next/dynamic";
import { withRouter } from "next/router";

import {
    GameStateProvider,
    useGameStateContext,
    useGameStatesDispatch,
} from "@shared/react-contexts/game-state-context/game-state-context";
import { useTranslator } from "@shared/react-hooks";
import GameBase from "@shared/components/game-base/";
import { GameMessageHandler } from "@shared/components/game-base/handlers";
import { GameBaseHandlers, GameBaseProps, GameBaseState } from "@shared/components/game-base/type";
import {
    PlinkoGameFinishHandler,
    PlinkoGameRoundDataHandler,
    PlinkoGameSoundHandler,
    PlinkoInGameHandler,
    PlinkoStateHandler,
} from "./handlers";
import BetPanel from "@plinko/components/plinko-game/bet-panel/bet-panel";
import { createPortal } from "react-dom";
import PlinkoGame from "../plinko-game/plinko-game";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";

// Dynamic imports side components
const Background = dynamic(() => import("@plinko/components/plinko-game/background"), { ssr: false });
const MenuIconWrapper = dynamic(() => import("@shared/components/game-components/menu/menu-icon-wrapper"), { ssr: false });
const SoundIcon = dynamic(() => import("@shared/components/game-components/menu/icons/sound"), { ssr: false });
const GuideIcon = dynamic(() => import("@shared/components/game-components/menu/icons/guide"), { ssr: false });
const PFIcon = dynamic(() => import("@shared/components/game-components/menu/icons/pf"), { ssr: false });
const PFSettingModal = dynamic(() => import("@shared/components/game-components/provably-fair/pf-setting"), { ssr: false });
const LiveStatsIcon = dynamic(() => import("@shared/components/game-components/menu/icons/live-stats"), { ssr: false });
const LiveStats = dynamic(() => import("@plinko/components/plinko-game/live-stats"), { ssr: false });
const BetHistoryControl = dynamic(() => import("@shared/components/game-components/bet-history/bet-history-control"), { ssr: false });
const BetHistoryTable = dynamic(() => import("@shared/components/game-components/bet-history/bet-history-table"), { ssr: false });
const PlayerResultBoardTable = dynamic(() => import("@plinko/components/plinko-game/player-result-board/player-result-board-table"), {
    ssr: false,
});
const PlinkoBetDetailModal = dynamic(() => import("@plinko/components/plinko-game/history"), { ssr: false });
const RoundMultiplierHistory = dynamic(() => import("../plinko-game/round-multiplier-history/round-multiplier-history"), { ssr: false });
const WinningAmountEffect = dynamic(() => import("../plinko-game/winning-amount-effect"), { ssr: false });

class PlinkoGameBase extends GameBase<GameBaseProps, GameBaseState> {
    private readonly inGameHandler: PlinkoInGameHandler;
    constructor(props: GameBaseProps) {
        // Create a basic gameMessageHandler for the handlers (GameBase will create its own)
        const gameMessageHandler = new GameMessageHandler(props.dispatch);
        const gameRoundDataHandler = new PlinkoGameRoundDataHandler();
        const roundStateHandler = new PlinkoStateHandler();

        const gameBaseHandlers: GameBaseHandlers = {
            roundStateHandler,
            gameMessageHandler: gameMessageHandler,
            gameRoundDataHandler: gameRoundDataHandler,
            gameSoundHandler: new PlinkoGameSoundHandler({ gameSound: () => props.gameSound }),
            gameFinishHandler: new PlinkoGameFinishHandler({
                dispatch: props.dispatch,
                gameMessageHandler: gameMessageHandler,
                durations: props.durations,
                roundStateHandler,
                runGame: () => {}, // Will be set by GameBase
                gameId: props.id,
                gameStateContextModel: () => props.gameStateContextModel,
                gameRoundDataHandler: gameRoundDataHandler,
            }),
        };
        super(props, gameBaseHandlers);

        this.inGameHandler = new PlinkoInGameHandler({
            dispatch: props.dispatch,
            gameMessageHandler: gameMessageHandler,
        });
    }

    registerHandlers() {
        super.registerHandlers();
        this.inGameHandler.registerEvents();
    }

    handleRemainingTime(_): void {
        // nothing
    }

    onSocketDisconnect(): void {
        super.onSocketDisconnect();
        usePlinkoGameStore.getState().reset();
    }

    renderGameFrame(): JSX.Element {
        return (
            <div className="relative h-full">
                <Background />
                <RoundMultiplierHistory />
                <PlinkoGame />
                <WinningAmountEffect />
                {this.renderNotice()}
            </div>
        );
    }

    renderLeftSide() {
        return (
            <div className="col-span-12 mb-3">
                <div className="flex flex-col md:flex-row-reverse md:mx-3">
                    <div className="w-full md:w-8/12">{this.renderGameFrame()}</div>
                    <div className="w-full md:w-4/12">{this.renderBetControl()}</div>
                </div>
                {this.renderMenu()}
            </div>
        );
    }

    renderBetOptions(): JSX.Element {
        // Plinko handles its own bet options within the PlinkoGame component
        return <></>;
    }

    renderChipControlPanel(): JSX.Element {
        // Plinko handles its own chip controls within the PlinkoGame component
        return <></>;
    }

    renderBetControl(): JSX.Element {
        return <BetPanel />;
    }

    renderRightSide(): JSX.Element {
        // Plinko doesn't need a right side panel
        return <></>;
    }

    renderBetDetailModal(): JSX.Element {
        // Plinko handles its own modals within the PlinkoGame component
        return <PlinkoBetDetailModal />;
    }

    renderMenuIcons() {
        return <MenuIconWrapper items={[<LiveStatsIcon />, <SoundIcon />, <GuideIcon />, <PFIcon />]} />;
    }

    renderPFSettingModal() {
        return createPortal(<PFSettingModal isSinglePlayer={true} />, document.getElementById("dashboard"));
    }

    renderLiveStatsModal() {
        return createPortal(<LiveStats />, document.getElementById("dashboard"));
    }

    renderBetHistoryTable(): JSX.Element {
        // Plinko handles its own bet history table within the PlinkoGame component
        return (
            <BetHistoryControl
                tabContent={[
                    <PlayerResultBoardTable key="player-result-board" />,
                    <BetHistoryTable key="bet-history-table" gameId={this.props.id?.toString()} />,
                ]}
            />
        );
    }
}

const PlinkoWrapper = (props: any) => {
    return (
        <GameStateProvider>
            <PlinkoFC {...props} />
        </GameStateProvider>
    );
};

const PlinkoFC = (props: any) => {
    const tolgeeNamespace = props["tolgeeNamespace"];
    const { t } = useTranslator([tolgeeNamespace]);

    return (
        <PlinkoGameBase
            {...props}
            {...{
                dispatch: useGameStatesDispatch(),
                gameStateContextModel: useGameStateContext(),
                translate: t,
                tolgeeNamespace,
            }}
        />
    );
};

export default withRouter(PlinkoWrapper);
