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
    PlinkoBetHistoryHandler,
    PlinkoGameFinishHandler,
    PlinkoGameRoundDataHandler,
    PlinkoGameSoundHandler,
    PlinkoRoundStateHandler,
    PlinkoLightningConfigHandler,
    PlinkoStateHandler,
    PlinkoSyncBalanceHandler,
} from "./handlers";
import BetPanel from "@plinko/components/plinko-game/bet-panel/bet-panel";
import { createPortal } from "react-dom";
import PlinkoGame from "../plinko-game/plinko-game";
import usePlinkoGameStore from "@plinko/shared/stores/plinko-game-store";
import { isMobileOnly } from "react-device-detect";
import { ResourceTypes } from "@shared/resources";
import { PLINKO_GAME_IDS } from "@plinko/constants";
import { getAppSettings } from "@shared/app-settings";
import Background from "@plinko/components/plinko-game/background";

// Dynamic imports side components
const MenuIconWrapper = dynamic(() => import("@shared/components/game-components/menu/menu-icon-wrapper"), { ssr: false });
const SoundIcon = dynamic(() => import("@shared/components/game-components/menu/icons/sound-icon"), { ssr: false });
const GuideIcon = dynamic(() => import("@shared/components/game-components/menu/icons/guide-icon"), { ssr: false });
const PFIcon = dynamic(() => import("@shared/components/game-components/menu/icons/pf-icon"), { ssr: false });
const PFSettingModal = dynamic(() => import("@shared/components/game-components/provably-fair/pf-setting"), { ssr: false });
const LiveStatsIcon = dynamic(() => import("@shared/components/game-components/menu/icons/live-stats-icon"), { ssr: false });
const LiveStats = dynamic(() => import("@plinko/components/plinko-game/live-stats"), { ssr: false });
const BetHistoryControl = dynamic(() => import("@shared/components/game-components/bet-history/bet-history-control"), { ssr: false });
const BetHistoryTable = dynamic(() => import("@shared/components/game-components/bet-history/bet-history-table"), { ssr: false });
const PlayerResultBoardTable = dynamic(() => import("@plinko/components/plinko-game/player-result-board/player-result-board-table"), {
    ssr: false,
});
const PlinkoBetDetail = dynamic(() => import("@plinko/components/plinko-game/history"), { ssr: false });
const RoundMultiplierHistory = dynamic(() => import("../plinko-game/round-multiplier-history/round-multiplier-history"), { ssr: false });
const WinningAmountEffect = dynamic(() => import("../plinko-game/winning-amount-effect"), { ssr: false });
const HotKeyIcon = dynamic(() => import("@shared/components/game-components/menu/icons/hot-key-icon"), { ssr: false });
const HotKeyModal = dynamic(() => import("@shared/components/game-components/hot-key"), { ssr: false });
const LobbyMenu = dynamic(() => import("@shared/components/game-components/lobby-menu"), { ssr: false });
const Header = dynamic(() => import("@shared/components/page-components/header"), { ssr: false });
const LightningKey = dynamic(() => import("@plinko/components/plinko-game/lightning-key"), { ssr: false });
const UserInfo = dynamic(() => import("@shared/components/page-components/header/user-info"), { ssr: false });

class PlinkoGameBase extends GameBase<GameBaseProps, GameBaseState> {
    private readonly plinkoRoundStateHandler: PlinkoRoundStateHandler;
    private readonly syncBalanceHandler: PlinkoSyncBalanceHandler;
    private readonly lightningConfigHandler: PlinkoLightningConfigHandler;

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
            betHistoryHandler: new PlinkoBetHistoryHandler({
                gameMessageHandler: gameMessageHandler,
                gameId: props.id.toString(),
            }),
        };
        super(props, gameBaseHandlers);

        this.plinkoRoundStateHandler = new PlinkoRoundStateHandler({
            dispatch: props.dispatch,
            gameMessageHandler: gameMessageHandler,
            gameStateContextModel: props.gameStateContextModel,
        });
        this.syncBalanceHandler = new PlinkoSyncBalanceHandler({ gameMessageHandler });
        this.lightningConfigHandler = new PlinkoLightningConfigHandler({
            gameMessageHandler: gameMessageHandler,
        });
    }

    registerHandlers() {
        super.registerHandlers();
        this.plinkoRoundStateHandler.registerEvents();
        this.syncBalanceHandler.registerEvents();
        this.lightningConfigHandler.registerEvents();
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
                <div>
                    <LightningKey />
                    <RoundMultiplierHistory />
                    <PlinkoGame />
                    <div> {this.renderNotice()}</div>
                </div>
            </div>
        );
    }

    renderLeftSide() {
        return (
            <div className="col-span-12 mb-3">
                <div className="flex flex-col lg:flex-row-reverse lg:mx-3">
                    <div className={`w-full lg:w-8/12 lg:flex-1`}>{this.renderGameFrame()}</div>
                    <div className={`w-full lg:w-4/12`}>{this.renderBetControl()}</div>
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

    renderNotice(): JSX.Element {
        const notice = super.renderNotice();
        if (!notice) {
            return notice;
        }

        // Apply mobile positioning similar to WinningAmountEffect
        return <div className="md:relative absolute bottom-[-10px] left-0 right-0 z-[200]">{notice}</div>;
    }

    renderBetDetailModal(): JSX.Element {
        // Plinko handles its own modals within the PlinkoGame component
        return <PlinkoBetDetail />;
    }

    renderMenuIcons() {
        return (
            <MenuIconWrapper
                items={[
                    <HotKeyIcon key="hot-key-icon" />,
                    <LiveStatsIcon key="live-stats-icon" />,
                    <SoundIcon key="sound-icon" />,
                    <GuideIcon key="guide-icon" />,
                    <PFIcon key="pf-icon" />,
                ]}
            />
        );
    }

    renderPFSettingModal() {
        return createPortal(<PFSettingModal isSinglePlayer={true} />, document.getElementById("dashboard"));
    }

    renderLiveStatsModal() {
        return createPortal(<LiveStats />, document.getElementById("dashboard"));
    }

    renderHotKeyModal() {
        return createPortal(<HotKeyModal />, document.getElementById("dashboard"));
    }

    renderBetHistoryTable(): JSX.Element {
        // Plinko handles its own bet history table within the PlinkoGame component
        return (
            <BetHistoryControl
                tabContent={[<PlayerResultBoardTable key="player-result-board" />, <BetHistoryTable key="bet-history-table" />]}
            />
        );
    }

    renderBackToLobbyButton() {
        const appType = getAppSettings().appType;

        if (this.props.id === PLINKO_GAME_IDS.PLINKO_X && appType === 1) {
            return <LobbyMenu />;
        }

        return <></>;
    }

    renderMenuLeftSide() {
        if (this.props.id === PLINKO_GAME_IDS.PLINKO) {
            return super.renderMenuLeftSide();
        }

        if (isMobileOnly) {
            return <></>;
        }
        return (
            <div className="flex items-center gap-2">
                <span className="text-sm md:text-base font-semibold">{this.props.translate(`${ResourceTypes.COMMON}.balance`)}:</span>
                <UserInfo customizeClass="text-winning-highlight" />
            </div>
        );
    }

    renderHeader() {
        if (isMobileOnly) {
            return <Header />;
        }
        return <></>;
    }

    get RTP() {
        return 99;
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
