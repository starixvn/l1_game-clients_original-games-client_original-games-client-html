import "../../../games/scoreboards";
import dynamic from "next/dynamic";
import { withRouter } from "next/router";
import React from "react";
import { isMobile, isMobileOnly } from "react-device-detect";
import { ErrorNoGameOffer } from "../../../_shared/constants/error-code-dictionary";
import { localStorageKeys, StorageHelper, broadcastNotice, getNotice } from "../../../_shared/helpers";
import { broadcastUserInfoRed } from "../../../_shared/helpers/global-events-helper";
import { useGlobalEventsStore } from "../../../_shared/stores/global-events-store/global-events-store";
import { loadURLContext, PlayerContextProvider, SettingContextProvider, updateURLContext } from "../../../_shared/react-contexts";
import { UserStakeLevel } from "../../game-base/type";
import { DashboardHandler } from "./handlers/dash-board-handler";
import { NotificationHandler } from "./handlers/notification-handler";
import { DashboardProps, DashboardState } from "./type";
import { LoadingSpinner } from "../../game-components/game-loading/loading-spinner";
import BalanceSyncProvider from "../../../_shared/react-hooks/providers/balance-sync-provider";

const SoundSettings = dynamic(() => import("../header/setting/settings-popup"));
const Games = dynamic(() => import("../../../games/games"), { loading: () => <LoadingSpinner /> });
const MusicPlayer = dynamic(() => import("../music-player"));
const LandscapeMode = dynamic(() => import("./landscape-mode/landscape-mode"));

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

        this.state = {
            userStakeLevel: { minBet: 0, maxBet: 0 },
            authorizeInfo: this.props.authorizeResponse,
            isShowErrorModal: false,
            apiError: null,
            isBlockUI: false,
            queryGame: this.props.queryGame,
            openGameId: null,
            openGameName: "",
            isLandscapeMode: false,
        };

        this.handleUpdateUserStakeLevel = this.handleUpdateUserStakeLevel.bind(this);
        this.signOut = this.signOut.bind(this);
        this.openGame = this.openGame.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
        this.changeOrientation = this.changeOrientation.bind(this);
        this.resetGameIdDashboardEvent = this.resetGameIdDashboardEvent.bind(this);
        this.updateUserBalance = this.updateUserBalance.bind(this);

        const buildId = process.env.buildVersion;
        const buildVersion = StorageHelper.get(localStorageKeys.buildVersion) ?? 0;
        if (buildId !== buildVersion) {
            StorageHelper.set(localStorageKeys.buildVersion, buildId);
            buildVersion && location.reload();
        }

        this.dashboardHandler = dashboardHandler ?? new DashboardHandler(this.props);

        this.notificationHandler =
            notificationHandler ?? new NotificationHandler(this.props.session, this.props.setIsUm, this.updateUserBalance, this.signOut);

        broadcastUserInfoRed(this.props.authorizeResponse.user.red);
    }

    updateUserBalance = (balance: number, setBalanceByPlaceBet = true) => {
        const authorizeInfo = { ...this.state.authorizeInfo };
        if (authorizeInfo.user.red !== balance) {
            authorizeInfo.user.red = balance;
            broadcastUserInfoRed(authorizeInfo.user.red);
            this.isUpdatingBalance = setBalanceByPlaceBet;
            this.setState({ authorizeInfo });
        }
    };

    onVisibilityChange() {
        if (!document["hidden"]) {
            this.notificationHandler.handleReCheckIn();
        }
    }

    changeOrientation() {
        setTimeout(() => {
            const isLandscapeMode = window.innerHeight < window.innerWidth;
            this.setState({ isLandscapeMode });
        }, 100);
    }

    resetGameIdDashboardEvent() {
        this.setState({ openGameId: 0 });
        this.forceUpdate();
    }

    shouldComponentUpdate(nextProps: Readonly<DashboardProps>, nextState: Readonly<DashboardState>, nextContext: any): boolean {
        if (this.state.openGameId > 0 && this.isUpdatingBalance) {
            this.isUpdatingBalance = false;
            return false;
        }

        return true;
    }

    async componentDidMount() {
        // Prevent double initialization
        if (this.backToLobbyEventId !== null) {
            return;
        }

        this.notificationHandler?.init();
        document.addEventListener("visibilitychange", this.onVisibilityChange);
        // Subscribe to back to lobby events from the store
        const unsubscribe = useGlobalEventsStore.subscribe((state) => {
            if (state.backToLobby) {
                this.resetGameIdDashboardEvent();
                // Reset the flag
                useGlobalEventsStore.getState().setBackToLobby(false);
            }
        });
        this.backToLobbyEventId = unsubscribe;

        const checkGameOffer = () => {
            if (this.dashboardHandler.checkIsNotOfferGame()) {
                broadcastNotice({
                    ...getNotice(ErrorNoGameOffer, false),
                    onClose: () => {},
                });
            }
        };

        // Check immediately
        checkGameOffer();

        // If data might not be ready, retry after a short delay
        if (!this.props.authorizeResponse) {
            setTimeout(() => {
                checkGameOffer();
            }, 1000);
        }

        if (isMobile) {
            this.changeOrientation();
            window.addEventListener("resize", this.changeOrientation);
            window.addEventListener("touchmove", this.preventZoomBehavior, { passive: false });
        }

        const { queryGame } = this.props;
        if (queryGame) {
            this.openGame(queryGame);
        }
    }

    private preventZoomBehavior(event: TouchEvent) {
        if (event.touches.length > 1) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }

    componentWillUnmount() {
        // Clean up event listeners and subscriptions
        if (this.backToLobbyEventId) {
            this.backToLobbyEventId();
            this.backToLobbyEventId = null;
        }

        document.removeEventListener("visibilitychange", this.onVisibilityChange);

        // Clean up mobile-specific event listeners
        if (isMobile) {
            window.removeEventListener("resize", this.changeOrientation);
            window.removeEventListener("touchmove", this.preventZoomBehavior);
        }

        this.notificationHandler.reset();
        this.dashboardHandler.reset();
    }

    signOut() {
        this.props.router.push("/timeout", "/timeout", { locale: this.props.tolgee.getLanguage() });
    }

    handleUpdateUserStakeLevel(userStakeLevel: UserStakeLevel) {
        this.setState({ userStakeLevel });
    }

    openGame(gameId: number) {
        this.setState({ queryGame: gameId, openGameId: gameId });
        updateURLContext({ gameId });
    }

    renderGames() {
        const { userStakeLevel, openGameName } = this.state;
        const urlContext = loadURLContext();

        return (
            <Games
                setApiErrorMessage={this.notificationHandler.handleShowApiErrorMessage}
                userStakeLevel={userStakeLevel}
                updateUserStakeLevel={this.handleUpdateUserStakeLevel}
                openGameId={urlContext?.gameId}
                openGameName={openGameName}
            />
        );
    }

    renderDashBoard() {
        window.history.pushState(null, null, "/");

        const { authorizeInfo } = this.state;
        const isRenderGames = true;

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

        return (
            <PlayerContextProvider value={authContextValue}>
                <BalanceSyncProvider>
                    <SettingContextProvider>
                        <div id={"dashboard"}>
                            <SoundSettings />

                            {renderOfferGameContainer()}

                            {<MusicPlayer />}
                        </div>
                    </SettingContextProvider>
                </BalanceSyncProvider>
            </PlayerContextProvider>
        );
    }

    render() {
        if (this.state.isLandscapeMode && isMobileOnly) {
            return <LandscapeMode />;
        }
        return this.renderDashBoard();
    }
}

export default withRouter(Dashboard);
