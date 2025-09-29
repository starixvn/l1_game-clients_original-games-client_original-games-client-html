import React, { Component } from "react";
import { withRouter } from "next/router";
import dynamic from "next/dynamic";
import { isMobile, isDesktop } from "react-device-detect";
import { ErrorNoGameOffer } from "@shared/constants/error-code-dictionary";
import { localStorageKeys, StorageHelper, broadcastNotice, getNotice } from "@shared/helpers";
import { broadcastUserInfoRed } from "@shared/helpers/global-events-helper";
import { useGlobalEventsStore } from "@shared/stores/global-events-store/global-events-store";
import { PlayerContextProvider } from "@shared/react-contexts";
import { UserStakeLevel } from "@shared/components/game-base/type";
import { DashboardHandler } from "./handlers/dash-board-handler";
import { NotificationHandler } from "./handlers/notification-handler";
import { DashboardProps, DashboardState } from "./type";
import { LoadingSpinner } from "@shared/components/game-components/game-loading/loading-spinner";
import BalanceSyncProvider from "@shared/react-hooks/providers/balance-sync-provider";
import { BASE_PATH } from '@shared/constants/base-path';
import { logger } from '@shared/services/logger';
import { logger as plinkoLogger } from '../../services/logger';
import LoggerControls from "../ui/components/controls/LoggerControls";
import PlinkoGame from "../../pages/index";

const SoundSettings = dynamic(() => import("@shared/components/page-components/header/setting/settings-popup"), { ssr: false });
const MusicPlayer = dynamic(() => import("@shared/components/page-components/music-player"), { ssr: false });

class Dashboard extends Component<DashboardProps, DashboardState> {
    private readonly dashboardHandler: DashboardHandler;
    private readonly notificationHandler: NotificationHandler;
    private backToLobbyEventId: (() => void) | null = null;
    private isUpdatingBalance = false;

    constructor(
        props: DashboardProps,
        state: DashboardState,
        dashboardHandler: DashboardHandler = null,
        notificationHandler: NotificationHandler = null
    ) {
        super(props);

        plinkoLogger.info('🏠 [DASHBOARD] Dashboard component initialized', {
            hasSession: !!props.session,
            hasAuthorizeResponse: !!props.authorizeResponse,
            queryGame: props.queryGame,
            username: props.session?.username,
            timestamp: new Date().toISOString()
        });

        this.state = {
            userStakeLevel: { minBet: 0, maxBet: 0 },
            authorizeInfo: this.props.authorizeResponse,
            isShowErrorModal: false,
            apiError: null,
            isBlockUI: false,
            queryGame: this.props.queryGame,
            openGameId: null,
            openGameName: "",
        };

        plinkoLogger.debug('📊 [DASHBOARD] Initial state set', {
            userStakeLevel: this.state.userStakeLevel,
            hasAuthorizeInfo: !!this.state.authorizeInfo,
            queryGame: this.state.queryGame
        });

        this.handleUpdateUserStakeLevel = this.handleUpdateUserStakeLevel.bind(this);
        this.signOut = this.signOut.bind(this);
        this.openGame = this.openGame.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        this.resetGameIdDashboardEvent = this.resetGameIdDashboardEvent.bind(this);
        this.updateUserBalance = this.updateUserBalance.bind(this);

        const buildId = process.env.buildVersion;
        const buildVersion = StorageHelper.get(localStorageKeys.buildVersion) ?? 0;

        plinkoLogger.debug('🔧 [DASHBOARD] Build version check', {
            currentBuildId: buildId,
            storedBuildVersion: buildVersion,
            needsReload: buildId !== buildVersion
        });

        if (buildId !== buildVersion) {
            StorageHelper.set(localStorageKeys.buildVersion, buildId);
            window.location.reload();
        }

        this.dashboardHandler = dashboardHandler || new DashboardHandler(this);
        this.notificationHandler = notificationHandler || new NotificationHandler(this);

        plinkoLogger.debug('🎛️ [DASHBOARD] Dashboard handler initialized');
        plinkoLogger.debug('🔔 [DASHBOARD] Notification handler initialized');

        // Broadcast user info
        if (this.props.authorizeResponse?.user?.red) {
            plinkoLogger.debug('📡 [DASHBOARD] User info broadcasted', {
                userRed: this.props.authorizeResponse.user.red
            });
            broadcastUserInfoRed(this.props.authorizeResponse.user.red);
        }
    }

    componentDidMount() {
        plinkoLogger.info('🚀 [DASHBOARD] Component mounted, starting initialization', {
            hasBackToLobbyEventId: !!this.backToLobbyEventId,
            timestamp: new Date().toISOString()
        });

        this.notificationHandler.initialize();
        this.dashboardHandler.reCheckIn();

        document.addEventListener("visibilitychange", this.onVisibilityChange);
        this.backToLobbyEventId = useGlobalEventsStore.getState().subscribe("resetGameIdDashboard", this.resetGameIdDashboardEvent);

        plinkoLogger.debug('👁️ [DASHBOARD] Adding visibility change listener');
        plinkoLogger.debug('📡 [DASHBOARD] Subscribing to global events store');

        this.dashboardHandler.checkGameOffer();
        this.dashboardHandler.openGame(this.props.queryGame);

        plinkoLogger.info('✅ [DASHBOARD] Component mount initialization completed');
    }

    componentWillUnmount() {
        document.removeEventListener("visibilitychange", this.onVisibilityChange);
        if (this.backToLobbyEventId) {
            this.backToLobbyEventId();
        }
    }

    shouldComponentUpdate(nextProps: DashboardProps, nextState: DashboardState) {
        const willUpdate =
            this.state.openGameId !== nextState.openGameId ||
            this.state.isUpdatingBalance !== nextState.isUpdatingBalance ||
            this.state.authorizeInfo !== nextState.authorizeInfo;

        plinkoLogger.debug('🔄 [DASHBOARD] Checking if component should update', {
            openGameId: this.state.openGameId,
            isUpdatingBalance: this.state.isUpdatingBalance,
            willUpdate
        });

        return willUpdate;
    }

    handleUpdateUserStakeLevel(userStakeLevel: UserStakeLevel) {
        plinkoLogger.info('💰 [DASHBOARD] User stake level updated', {
            minBet: userStakeLevel.minBet,
            maxBet: userStakeLevel.maxBet
        });
        this.setState({ userStakeLevel });
    }

    signOut() {
        plinkoLogger.info('🚪 [DASHBOARD] User signing out');
        this.props.setIsUm(false);
    }

    openGame(gameId: number) {
        plinkoLogger.info('🎮 [DASHBOARD] Opening game', {
            gameId,
            currentOpenGameId: this.state.openGameId
        });
        this.setState({ openGameId: gameId });
    }

    updateUserBalance = (balance: number, setBalanceByPlaceBet = true) => {
        plinkoLogger.info('💰 [DASHBOARD] Updating user balance', {
            newBalance: balance,
            currentBalance: this.state.authorizeInfo.user.red,
            setBalanceByPlaceBet,
            balanceChanged: this.state.authorizeInfo.user.red !== balance
        });

        const authorizeInfo = { ...this.state.authorizeInfo };
        if (authorizeInfo.user.red !== balance) {
            authorizeInfo.user.red = balance;
            broadcastUserInfoRed(authorizeInfo.user.red);
            this.isUpdatingBalance = setBalanceByPlaceBet;
            this.setState({ authorizeInfo });

            plinkoLogger.info('✅ [DASHBOARD] Balance updated successfully', {
                newBalance: balance,
                isUpdatingBalance: this.isUpdatingBalance
            });
        } else {
            plinkoLogger.debug('💰 [DASHBOARD] Balance unchanged, no update needed', {
                balance
            });
        }
    };

    onVisibilityChange() {
        plinkoLogger.debug('👁️ [DASHBOARD] Page visibility changed', {
            isHidden: document["hidden"]
        });

        if (!document["hidden"]) {
            plinkoLogger.info('👁️ [DASHBOARD] Page became visible, handling re-check in');
            this.notificationHandler.handleReCheckIn();
        }
    }

    resetGameIdDashboardEvent() {
        plinkoLogger.info('🔄 [DASHBOARD] Resetting game ID dashboard event');
        this.setState({ openGameId: null });
    }

    renderGames() {
        const { openGameId, userStakeLevel } = this.state;
        const { authorizeInfo } = this.state;

        plinkoLogger.debug('🎮 [DASHBOARD] Rendering games component', {
            openGameId,
            openGameName: "",
            userStakeLevel
        });

        if (openGameId === 145) { // Plinko game ID
            return (
                <PlinkoGame />
            );
        }

        return (
            <LoadingSpinner />
        );
    }

    renderDashBoard() {
        const dashboardPath = BASE_PATH || "/";
        plinkoLogger.debug('🏠 [DASHBOARD] Rendering dashboard', {
            dashboardPath,
            isDesktop
        });

        window.history.pushState(null, null, dashboardPath);

        const { authorizeInfo } = this.state;
        const renderOfferGameContainer = () => this.renderGames();

        const authContextValue = {
            authorizeInfo: authorizeInfo,
            session: this.props.session,
            setBalance: this.updateUserBalance,
            signOut: this.signOut,
            fractionalOddsFormat: authorizeInfo.user?.fractionalOddsFormat ?? false,
            enableQuickBet: true,
            locale: this.props.tolgee.getLanguage(),
        };

        plinkoLogger.debug('🔐 [DASHBOARD] Auth context value prepared', {
            hasAuthorizeInfo: !!authContextValue.authorizeInfo,
            hasSession: !!authContextValue.session,
            fractionalOddsFormat: authContextValue.fractionalOddsFormat,
            enableQuickBet: authContextValue.enableQuickBet,
            locale: authContextValue.locale
        });

        return (
            <PlayerContextProvider value={authContextValue}>
                <BalanceSyncProvider>
                    <div id={"dashboard"} className={`${isDesktop ? "desktop-dashboard" : ""}`}>
                        <SoundSettings />

                        {renderOfferGameContainer()}

                        {<MusicPlayer />}

                        <LoggerControls className="fixed top-4 right-4 z-50" />
                    </div>
                </BalanceSyncProvider>
            </PlayerContextProvider>
        );
    }

    render() {
        return this.renderDashBoard();
    }
}

export default withRouter(Dashboard);
