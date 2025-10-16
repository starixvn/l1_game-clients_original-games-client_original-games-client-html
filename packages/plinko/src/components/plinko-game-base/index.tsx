import React, { JSX } from "react";
import dynamic from "next/dynamic";
import { withRouter } from "next/router";
import { isMobile } from "react-device-detect";

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

// Helper function to create game handlers
const createGameHandlers = (props: GameBaseProps): GameBaseHandlers => {
    const gameMessageHandler = new GameMessageHandler(props.dispatch);
    const gameRoundDataHandler = new PlinkoGameRoundDataHandler();
    const roundStateHandler = new PlinkoStateHandler();

    return {
        roundStateHandler,
        gameMessageHandler,
        gameRoundDataHandler,
        gameSoundHandler: new PlinkoGameSoundHandler({ gameSound: () => props.gameSound }),
        gameFinishHandler: new PlinkoGameFinishHandler({
            dispatch: props.dispatch,
            gameMessageHandler,
            durations: props.durations,
            roundStateHandler,
            runGame: () => { }, // Will be set by GameBase
            gameId: props.id,
            gameStateContextModel: () => props.gameStateContextModel,
            gameRoundDataHandler,
        }),
    };
};

class PlinkoGameBase extends GameBase<GameBaseProps, GameBaseState> {
    private readonly inGameHandler: PlinkoInGameHandler;
    private readonly plinkoGameRef = React.createRef<{ getScaledHeight: () => number; getWrapperScale: () => number }>();
    private readonly gameFrameWrapperRef = React.createRef<HTMLDivElement>();
    private readonly gameFrameWrapperWithoutBackgroundRef = React.createRef<HTMLDivElement>();

    constructor(props: GameBaseProps) {
        const gameBaseHandlers = createGameHandlers(props);
        super(props, gameBaseHandlers);

        this.inGameHandler = new PlinkoInGameHandler({
            dispatch: props.dispatch,
            gameMessageHandler: gameBaseHandlers.gameMessageHandler,
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
        // Get the wrapper scale from the PlinkoGame component for desktop scaling
        const wrapperScale = this.plinkoGameRef.current?.getWrapperScale() ?? 1;

        return (
            <div
                ref={this.gameFrameWrapperRef}
                className="relative h-full"
                id="plinko-game-frame-wrapper"
            >
                <Background />
                <div
                    ref={this.gameFrameWrapperWithoutBackgroundRef}
                    id="plinko-game-frame-wrapper-without-background"
                    style={{
                        transform: `scale(${wrapperScale})`,
                        transformOrigin: 'center top'
                    }}
                >
                    <RoundMultiplierHistory />
                    <PlinkoGame
                        ref={this.plinkoGameRef}
                        gameFrameWrapperWithoutBackgroundRef={this.gameFrameWrapperWithoutBackgroundRef}
                    />
                    <WinningAmountEffect />
                    {this.renderNotice()}
                </div>

            </div>
        );
    }

    renderLeftSide() {
        // Get the scaled height from the PlinkoGame component
        const scaledHeight = 450;

        // Apply scaled height only for mobile devices
        const heightStyle = isMobile ? { height: `${scaledHeight}px` } : {};

        return (
            <div className="col-span-12 mb-3">
                <div className="flex flex-col md:flex-row-reverse md:mx-3">
                    <div
                        className="w-full md:w-8/12"
                        style={heightStyle}
                    >
                        {this.renderGameFrame()}
                    </div>
                    <div className="w-full md:w-4/12" style={{ zIndex: 9999 }}>{this.renderBetControl()}</div>
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
        return <MenuIconWrapper items={[<LiveStatsIcon key="live-stats-icon" />, <SoundIcon key="sound-icon" />, <GuideIcon key="guide-icon" />, <PFIcon key="pf-icon" />]} />;
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
