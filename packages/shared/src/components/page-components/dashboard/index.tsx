import dynamic from "next/dynamic";
import { withRouter } from "next/router";
import React from "react";
import styles from "./dashboard.module.scss";
import { isMobile, isDesktop } from "react-device-detect";
import { ErrorNoGameOffer } from "@shared/constants/error-code-dictionary";
import { localStorageKeys, StorageHelper, broadcastNotice, getNotice } from "@shared/helpers";
import { broadcastUserInfoRed } from "@shared/helpers/global-events-helper";
import { useGlobalEventsStore } from "@shared/stores/global-events-store/global-events-store";
import { PlayerContextProvider } from "@shared/react-contexts";
import { UserStakeLevel } from "../../game-base/type";
import { DashboardHandler } from "./handlers/dash-board-handler";
import { NotificationHandler } from "./handlers/notification-handler";
import { DashboardProps, DashboardState } from "./type";
import { LoadingSpinner } from "../../game-components/game-loading/loading-spinner";
import BalanceSyncProvider from "@shared/react-hooks/providers/balance-sync-provider";
import { BASE_PATH } from '@shared/constants/base-path';
import { logger } from '@shared/services/logger';
import LoggerControls from "@shared/components/game-components/logger-controls/LoggerControls";

const SoundSettings = dynamic(() => import("../header/setting/settings-popup"), { ssr: false });
// @ts-ignore - Next.js dynamic imports resolve at runtime
const Games = dynamic(() => import("@shared/components/game-components/games"), { loading: () => <LoadingSpinner /> }) as React.ComponentType<GamesProps>;
const MusicPlayer = dynamic(() => import("../music-player"), { ssr: false });

class Dashboard extends React.Component<DashboardProps, DashboardState> {
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

        logger.info('🏠 [DASHBOARD] Dashboard component initialized', {
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

        logger.debug('📊 [DASHBOARD] Initial state set', {
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

        logger.debug('🔧 [DASHBOARD] Build version check', {
            currentBuildId: buildId,
            storedBuildVersion: buildVersion,
            needsReload: buildId !== buildVersion
        });

        if (buildId !== buildVersion) {
            logger.info('🔄 [DASHBOARD] Build version mismatch, reloading page', {
                newBuildId: buildId,
                oldBuildVersion: buildVersion
            });
            StorageHelper.set(localStorageKeys.buildVersion, buildId);
            buildVersion && location.reload();
        }

        this.dashboardHandler = dashboardHandler ?? new DashboardHandler(this.props);
        logger.debug('🎛️ [DASHBOARD] Dashboard handler initialized');

        this.notificationHandler =
            notificationHandler ?? new NotificationHandler(this.props.session, this.props.setIsUm, this.updateUserBalance, this.signOut);
        logger.debug('🔔 [DASHBOARD] Notification handler initialized');

        broadcastUserInfoRed(this.props.authorizeResponse.user.red);
        logger.debug('📡 [DASHBOARD] User info broadcasted', {
            userRed: this.props.authorizeResponse.user.red
        });
    }

    updateUserBalance = (balance: number, setBalanceByPlaceBet = true) => {
        logger.info('💰 [DASHBOARD] Updating user balance', {
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

            logger.info('✅ [DASHBOARD] Balance updated successfully', {
                newBalance: balance,
                isUpdatingBalance: this.isUpdatingBalance
            });
        } else {
            logger.debug('💰 [DASHBOARD] Balance unchanged, no update needed', {
                balance
            });
        }
    };

    onVisibilityChange() {
        logger.debug('👁️ [DASHBOARD] Page visibility changed', {
            isHidden: document["hidden"]
        });

        if (!document["hidden"]) {
            logger.info('👁️ [DASHBOARD] Page became visible, handling re-check in');
            this.notificationHandler.handleReCheckIn();
        }
    }

    resetGameIdDashboardEvent() {
        logger.info('🔄 [DASHBOARD] Resetting game ID dashboard event', {
            currentOpenGameId: this.state.openGameId
        });
        this.setState({ openGameId: 0 });
        this.forceUpdate();
    }

    shouldComponentUpdate(nextProps: Readonly<DashboardProps>, nextState: Readonly<DashboardState>, nextContext: any): boolean {
        logger.debug('🔄 [DASHBOARD] Checking if component should update', {
            openGameId: this.state.openGameId,
            isUpdatingBalance: this.isUpdatingBalance,
            willUpdate: !(this.state.openGameId > 0 && this.isUpdatingBalance)
        });

        if (this.state.openGameId > 0 && this.isUpdatingBalance) {
            this.isUpdatingBalance = false;
            logger.debug('⏸️ [DASHBOARD] Skipping update due to balance update in progress');
            return false;
        }

        return true;
    }

    async componentDidMount() {
        logger.info('🚀 [DASHBOARD] Component mounted, starting initialization', {
            hasBackToLobbyEventId: this.backToLobbyEventId !== null,
            timestamp: new Date().toISOString()
        });

        // Prevent double initialization
        if (this.backToLobbyEventId !== null) {
            logger.warn('⚠️ [DASHBOARD] Double initialization prevented');
            return;
        }

        logger.info('🔔 [DASHBOARD] Initializing notification handler');
        this.notificationHandler?.init();

        logger.debug('👁️ [DASHBOARD] Adding visibility change listener');
        document.addEventListener("visibilitychange", this.onVisibilityChange);

        // Subscribe to back to lobby events from the store
        logger.debug('📡 [DASHBOARD] Subscribing to global events store');
        const unsubscribe = useGlobalEventsStore.subscribe((state) => {
            if (state.backToLobby) {
                logger.info('🏠 [DASHBOARD] Back to lobby event received');
                this.resetGameIdDashboardEvent();
                // Reset the flag
                useGlobalEventsStore.getState().setBackToLobby(false);
            }
        });
        this.backToLobbyEventId = unsubscribe;

        const checkGameOffer = () => {
            logger.debug('🎮 [DASHBOARD] Checking game offer availability');
            if (this.dashboardHandler.checkIsNotOfferGame()) {
                logger.warn('⚠️ [DASHBOARD] No game offer available, showing error notice');
                broadcastNotice({
                    ...getNotice(ErrorNoGameOffer, false),
                    onClose: () => { },
                });
            } else {
                logger.debug('✅ [DASHBOARD] Game offer available');
            }
        };

        // Check immediately
        logger.debug('🎮 [DASHBOARD] Performing initial game offer check');
        checkGameOffer();

        // If data might not be ready, retry after a short delay
        if (!this.props.authorizeResponse) {
            logger.info('⏰ [DASHBOARD] No authorize response, scheduling delayed game offer check');
            setTimeout(() => {
                logger.debug('🎮 [DASHBOARD] Performing delayed game offer check');
                checkGameOffer();
            }, 1000);
        }

        if (isMobile) {
            logger.debug('📱 [DASHBOARD] Mobile device detected, adding touch move listener');
            window.addEventListener("touchmove", this.preventZoomBehavior, { passive: false });
        }

        const { queryGame } = this.props;
        if (queryGame) {
            logger.info('🎮 [DASHBOARD] Query game specified, opening game', { queryGame });
            this.openGame(queryGame);
        } else {
            logger.debug('🎮 [DASHBOARD] No query game specified');
        }

        logger.info('✅ [DASHBOARD] Component mount initialization completed');
    }

    private preventZoomBehavior(event: TouchEvent) {
        if (event.touches.length > 1) {
            logger.debug('📱 [DASHBOARD] Preventing zoom behavior', {
                touchCount: event.touches.length
            });
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    componentWillUnmount() {
        logger.info('🧹 [DASHBOARD] Component unmounting, cleaning up resources');

        // Clean up event listeners and subscriptions
        if (this.backToLobbyEventId) {
            logger.debug('📡 [DASHBOARD] Unsubscribing from global events store');
            this.backToLobbyEventId();
            this.backToLobbyEventId = null;
        }

        logger.debug('👁️ [DASHBOARD] Removing visibility change listener');
        document.removeEventListener("visibilitychange", this.onVisibilityChange);

        // Clean up mobile-specific event listeners
        if (isMobile) {
            logger.debug('📱 [DASHBOARD] Removing mobile touch move listener');
            window.removeEventListener("touchmove", this.preventZoomBehavior);
        }

        logger.debug('🔔 [DASHBOARD] Resetting notification handler');
        this.notificationHandler.reset();

        logger.debug('🎛️ [DASHBOARD] Resetting dashboard handler');
        this.dashboardHandler.reset();

        logger.info('✅ [DASHBOARD] Component cleanup completed');
    }

    signOut() {
        logger.info('🚪 [DASHBOARD] User signing out', {
            currentLocale: this.props.tolgee.getLanguage()
        });
        this.props.router.push("/timeout", "/timeout", { locale: this.props.tolgee.getLanguage() });
    }

    handleUpdateUserStakeLevel(userStakeLevel: UserStakeLevel) {
        logger.info('🎯 [DASHBOARD] Updating user stake level', {
            minBet: userStakeLevel.minBet,
            maxBet: userStakeLevel.maxBet
        });
        this.setState({ userStakeLevel });
    }

    openGame(gameId: number) {
        logger.info('🎮 [DASHBOARD] Opening game', {
            gameId,
            currentOpenGameId: this.state.openGameId
        });
        this.setState({ queryGame: gameId, openGameId: gameId });
    }

    renderGames() {
        const { userStakeLevel, openGameName, openGameId } = this.state;

        logger.debug('🎮 [DASHBOARD] Rendering games component', {
            openGameId,
            openGameName,
            userStakeLevel: {
                minBet: userStakeLevel.minBet,
                maxBet: userStakeLevel.maxBet
            }
        });

        return (
            <Games
                setApiErrorMessage={this.notificationHandler.handleShowApiErrorMessage}
                userStakeLevel={userStakeLevel}
                updateUserStakeLevel={this.handleUpdateUserStakeLevel}
                openGameId={openGameId}
                openGameName={openGameName}
            />
        );
    }

    renderDashBoard() {
        const dashboardPath = BASE_PATH || "/";
        logger.debug('🏠 [DASHBOARD] Rendering dashboard', {
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

        logger.debug('🔐 [DASHBOARD] Auth context value prepared', {
            hasAuthorizeInfo: !!authContextValue.authorizeInfo,
            hasSession: !!authContextValue.session,
            fractionalOddsFormat: authContextValue.fractionalOddsFormat,
            enableQuickBet: authContextValue.enableQuickBet,
            locale: authContextValue.locale
        });

        return (
            <PlayerContextProvider value={authContextValue}>
                <BalanceSyncProvider>
                    <div id={"dashboard"} className={`${isDesktop ? styles["desktop-dashboard"] : ""}`}>
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
