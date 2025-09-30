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
import { GameMessageHandler, messageEventType } from "@shared/components/game-base/handlers";
import { GameBaseHandlers, GameBaseProps, GameBaseState } from "@shared/components/game-base/type";
import { PlinkoGameRoundDataHandler, PlinkoGameSoundHandler, PlinkoStateHandler } from "./handlers";
import PlinkoGame from "../plinko-game/PlinkoGame";
import { logger } from "../../services/logger";

// Dynamic imports for shared components
const Background = dynamic(() => import("@shared/components/game-components/background"), { ssr: false });
const Menu = dynamic(() => import("@shared/components/game-components/menu/menu"), { ssr: false });
const Header = dynamic(() => import("@shared/components/page-components/header"), { ssr: false });

class PlinkoGameBase extends GameBase<GameBaseProps, GameBaseState> {
    private plinkoGameMessageHandler: GameMessageHandler;

    constructor(props: GameBaseProps) {
        // Create Plinko-specific game message handler
        const gameMessageHandler = new GameMessageHandler(props.dispatch);

        // Register Plinko-specific SIGNED_IN handler
        gameMessageHandler.register(messageEventType.SIGNED_IN, (action) => {
            if (action?.[messageEventType.SIGNED_IN]) {
                const { socket } = require("@shared/stores").useGameStore.getState();
                if (socket?.connected) {
                    logger.info('Sending inGame event to plinko service');
                    socket.emit("inGame"); // Send inGame without parameters as expected by plinko service
                }
            }
        });

        const gameBaseHandlers: GameBaseHandlers = {
            roundStateHandler: new PlinkoStateHandler(),
            gameMessageHandler: gameMessageHandler,
            gameRoundDataHandler: new PlinkoGameRoundDataHandler(),
            gameSoundHandler: new PlinkoGameSoundHandler({ gameSound: () => props.gameSound }),
        };
        super(props, gameBaseHandlers);

        this.plinkoGameMessageHandler = gameMessageHandler;

        logger.info('🏠 [PLINKO GAME BASE] PlinkoGameBase initialized', {
            gameId: props.id,
            timestamp: new Date().toISOString()
        });
    }

    componentDidMount() {
        super.componentDidMount();
        logger.info('🚀 [PLINKO GAME BASE] Component mounted');
    }

    renderGameFrame(): JSX.Element {
        logger.debug('🎮 [PLINKO GAME BASE] Rendering game frame');

        return (
            <div className="flex flex-col items-center justify-center relative min-h-screen">
                <Background gameId={this.props.id} />
                <Header />

                {/* Plinko specific game content */}
                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl mx-auto px-4">
                    <PlinkoGame />
                </div>

                {this.renderNotice()}
                <Menu />
            </div>
        );
    }

    renderBetOptions(): JSX.Element {
        // Plinko handles its own bet options within the PlinkoGame component
        return <></>;
    }

    renderBettingBlock(): JSX.Element {
        // Plinko handles its own betting block within the PlinkoGame component
        return <></>;
    }

    renderChipControlPanel(): JSX.Element {
        // Plinko handles its own chip controls within the PlinkoGame component
        return <></>;
    }

    renderBetControl(): JSX.Element {
        // Plinko handles its own bet controls within the PlinkoGame component
        return <></>;
    }

    renderRightSide(): JSX.Element {
        // Plinko doesn't need a right side panel
        return <></>;
    }

    renderBetDetailModal(): JSX.Element {
        // Plinko handles its own modals within the PlinkoGame component
        return <></>;
    }

    renderMoreMenuIcon(): JSX.Element {
        // Plinko can customize menu icons if needed
        return <></>;
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
