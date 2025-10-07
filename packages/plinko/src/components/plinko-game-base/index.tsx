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
import { PlinkoGameFinishHandler, PlinkoGameRoundDataHandler, PlinkoGameSoundHandler, PlinkoStateHandler } from "./handlers";
import PlinkoGame from "../plinko-game/PlinkoGame";
import { logger } from "../../services/logger";
import BetHistoryControl from "@shared/components/game-components/bet-history/bet-history-control";
import { BetHistoryTable } from "@shared/components/game-components/bet-history/bet-history-table";
import { PlayerResultBoardTable } from "@plinko/components/plinko-game/player-result-board/player-result-board-table";
import PlinkoBetDetailModal from "../plinko-game/history";
import BetPanel from "@plinko/components/plinko-game/bet-panel/bet-panel";
import { PFSettingModal } from "@shared/components/game-components/provably-fair";
import { createPortal } from "react-dom";
import LiveStatsIcon from "@shared/components/game-components/menu/icons/live-stats";
import LiveStats from "@plinko/components/plinko-game/live-stats";

// Dynamic imports for shared components
const Background = dynamic(() => import("@shared/components/game-components/background"), { ssr: false });
const MenuIconWrapper = dynamic(() => import("@shared/components/game-components/menu/menu-icon-wrapper"), { ssr: false });
const SoundIcon = dynamic(() => import("@shared/components/game-components/menu/icons/sound"), { ssr: false });
const GuideIcon = dynamic(() => import("@shared/components/game-components/menu/icons/guide"), { ssr: false });
const PFIcon = dynamic(() => import("@shared/components/game-components/menu/icons/pf"), { ssr: false });

class PlinkoGameBase extends GameBase<GameBaseProps, GameBaseState> {
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

        logger.info("🏠 [PLINKO GAME BASE] PlinkoGameBase initialized", {
            gameId: props.id,
            timestamp: new Date().toISOString(),
        });
    }

    componentDidMount() {
        super.componentDidMount();
        logger.info("🚀 [PLINKO GAME BASE] Component mounted");

        // Game initialization will be handled by the gameConfigs message handler
        // No need for setTimeout since we properly wait for the service response
    }

    handleRemainingTime(_): void {
        // nothing
    }

    renderGameFrame(): JSX.Element {
        logger.debug("🎮 [PLINKO GAME BASE] Rendering game frame");

        return (
            <div>
                <Background gameId={this.props.id} />
                <PlinkoGame />
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
                defaultTab={"all-bets"}
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
