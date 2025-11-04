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
import { BASE_PATH } from "@shared/constants/base-path";

const SoundSettings = dynamic(() => import("../header/setting/settings-popup"), { ssr: false });
// @ts-ignore - Next.js dynamic imports resolve at runtime
const Games = dynamic(() => import("@/games/games"), { loading: () => <LoadingSpinner /> }) as React.ComponentType<GamesProps>;
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



        this.handleUpdateUserStakeLevel = this.handleUpdateUserStakeLevel.bind(this);
        this.signOut = this.signOut.bind(this);
        this.openGame = this.openGame.bind(this);
        this.onVisibilityChange = this.onVisibilityChange.bind(this);
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


        } else {

        }
    };

    onVisibilityChange() {


        if (!document["hidden"]) {

            this.notificationHandler.handleReCheckIn();
        }
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
                    onClose: () => { },
                });
            } else {

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

            window.addEventListener("touchmove", this.preventZoomBehavior, { passive: false });
        }

        const { queryGame } = this.props;
        if (queryGame) {

            this.openGame(queryGame);
        } else {

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
    }

    renderGames() {
        const { userStakeLevel, openGameName, openGameId } = this.state;



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



        return (
            <PlayerContextProvider value={authContextValue}>
                <BalanceSyncProvider>
                    <div id={"dashboard"} className={`${isDesktop ? styles["desktop-dashboard"] : styles["mobile-dashboard"]}`}>
                        <SoundSettings />

                        {renderOfferGameContainer()}

                        {<MusicPlayer />}

                        {/* <LoggerControls className="fixed top-4 right-4 z-50" /> */}
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
