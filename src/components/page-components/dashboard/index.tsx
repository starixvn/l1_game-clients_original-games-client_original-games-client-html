import "../../../games/scoreboards";

import dynamic from "next/dynamic";
import { withRouter } from "next/router";
import React from "react";
import { isDesktop, isMobile, isMobileOnly } from "react-device-detect";

import { ErrorNoGameOffer } from "../../../_shared/constants/error-code-dictionary";
import { GetLocalizedErrorMessage, localStorageKeys, StorageHelper } from "../../../_shared/helpers";
import {
    GlobalMessageTransmitter,
    GlobalTransmitterEvent,
    registerGlobalMessageEvent,
    unsubscribeGlobalMessageEvent,
} from "../../../_shared/helpers/message-transmitter/global-transmitter";
import { loadURLContext, PlayerContextProvider, SettingContextProvider, updateURLContext } from "../../../_shared/react-contexts";
import { UserStakeLevel } from "../../game-base/type";
import { ModalType } from "../../game-components/base-dialog/type";
import { ErrorApiText } from "../../game-components/error-api-text";

import Header from "../header";

import Styles from "./dashboard.module.scss";
import { DashboardHandler } from "./handlers/dash-board-handler";
import { NotificationHandler } from "./handlers/notification-handler";
import { DashboardProps, DashboardState } from "./type";
import { LoadingSpinner } from "../../game-components/game-loading/loading-spinner";

const SoundSettings = dynamic(() => import("../header/setting/settings-popup"));
const Games = dynamic(() => import("../../../games/games"), { loading: () => <LoadingSpinner /> });
const BaseDialog = dynamic(() => import("../../game-components/base-dialog"));
const MusicPlayer = dynamic(() => import("../music-player"));
const LandscapeMode = dynamic(() => import("./landscape-mode/landscape-mode"));

class Dashboard extends React.Component<DashboardProps, DashboardState> {
    private readonly dashboardHandler: DashboardHandler;
    private readonly notificationHandler: NotificationHandler;
    private backToLobbyEventId = null;
    private isUpdatingBalance = false;

    constructor(
        props: DashboardProps,
        state: DashboardState,
        dashboardHandler: DashboardHandler = null,
        notificationHandler: NotificationHandler = null
    ) {
        super(props);

        console.log("[Dashboard] constructor called with props:", {
            authorizeResponse: !!props.authorizeResponse,
            queryGame: props.queryGame,
            session: !!props.session,
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
            isLandscapeMode: false,

            dashBoardHeight: 0,
        };

        console.log("[Dashboard] initial state:", this.state);

        this.closeDialog = this.closeDialog.bind(this);
        this.showApiErrorMessage = this.showApiErrorMessage.bind(this);
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
            console.log("[Dashboard] build version changed, reloading");
            StorageHelper.set(localStorageKeys.buildVersion, buildId);
            buildVersion && location.reload();
        }

        this.dashboardHandler = dashboardHandler ?? new DashboardHandler(this.props, () => { });

        this.notificationHandler =
            notificationHandler ??
            new NotificationHandler(this.props.session, this.props.setIsUm, this.updateUserBalance, this.showApiErrorMessage, this.signOut);

        GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.USER_INFO_RED]: this.props.authorizeResponse.user.red });
    }

    updateUserBalance = (balance: number, setBalanceByPlaceBet = true) => {
        console.log("[Dashboard] updateUserBalance called with:", { balance, setBalanceByPlaceBet });
        const authorizeInfo = { ...this.state.authorizeInfo };
        if (authorizeInfo.user.red !== balance) {
            authorizeInfo.user.red = balance;
            GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.USER_INFO_RED]: authorizeInfo.user.red });
            this.isUpdatingBalance = setBalanceByPlaceBet;
            this.setState({ authorizeInfo });
        }
    };

    onVisibilityChange() {
        console.log("[Dashboard] onVisibilityChange called, document.hidden:", document["hidden"]);
        if (!document["hidden"]) {
            this.notificationHandler.handleReCheckIn();
        }
    }

    changeOrientation() {
        console.log("[Dashboard] changeOrientation called");
        setTimeout(() => {
            const isLandscapeMode = window.innerHeight < window.innerWidth;
            console.log("[Dashboard] isLandscapeMode:", isLandscapeMode);
            this.setState({ isLandscapeMode });
        }, 100);
    }

    resetGameIdDashboardEvent() {
        console.log("[Dashboard] resetGameIdDashboardEvent called");
        this.setState({ openGameId: 0 });
        this.forceUpdate();
    }

    shouldComponentUpdate(nextProps: Readonly<DashboardProps>, nextState: Readonly<DashboardState>, nextContext: any): boolean {
        if (this.state.openGameId > 0 && this.isUpdatingBalance) {
            this.isUpdatingBalance = false;
            console.log("[Dashboard] shouldComponentUpdate: preventing update due to balance update");
            return false;
        }

        console.log("[Dashboard] shouldComponentUpdate: allowing update");
        return true;
    }

    async componentDidMount() {
        console.log("[Dashboard] componentDidMount called");

        const { dashBoardHeight } = this.state;

        const zoomGame = +getComputedStyle(document.getElementById("dashboard")).getPropertyValue("--zoom-game");

        if (isDesktop && dashBoardHeight !== window.innerHeight) {
            const scaleHeight = document.getElementById("dashboard").clientHeight * zoomGame;
            this.setState({
                dashBoardHeight: window.innerHeight + (window.innerHeight - scaleHeight) * (window.innerHeight / scaleHeight),
            });
        }

        document.addEventListener("visibilitychange", this.onVisibilityChange);
        this.backToLobbyEventId = registerGlobalMessageEvent(GlobalTransmitterEvent.BACK_TO_LOBBY, async () =>
            this.resetGameIdDashboardEvent()
        );

        // Fix: Add retry mechanism for timing issues with data availability
        const checkGameOffer = () => {
            console.log("[Dashboard] checkGameOffer called");
            if (this.dashboardHandler.checkIsNotOfferGame()) {
                console.log("[Dashboard] game not in offer, showing error modal");
                this.setState({
                    apiError: {
                        message: ErrorNoGameOffer,
                        errorCode: "",
                    },
                    isShowErrorModal: true,
                    isBlockUI: true,
                });
            }
        };

        // Check immediately
        checkGameOffer();

        // If data might not be ready, retry after a short delay
        if (!this.props.authorizeResponse || !this.props.lobbyConfigs) {
            console.log("[Dashboard] data not ready, retrying after 1 second");
            setTimeout(() => {
                checkGameOffer();
            }, 1000); // Retry after 1 second
        }

        if (isMobile) {
            this.changeOrientation();
            window.addEventListener("resize", this.changeOrientation);
            window.addEventListener("touchmove", this.preventZoomBehavior, { passive: false });
        }

        const { queryGame } = this.props;
        if (queryGame) {
            console.log("[Dashboard] opening game with queryGame:", queryGame);
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
        console.log("[Dashboard] componentWillUnmount called");
        unsubscribeGlobalMessageEvent(this.backToLobbyEventId);
        document.removeEventListener("visibilitychange", this.onVisibilityChange);

        this.notificationHandler.reset();
        this.dashboardHandler.reset();
    }

    signOut() {
        console.log("[Dashboard] signOut called");
        this.props.router.push("/timeout", "/timeout", { locale: this.props.tolgee.getLanguage() });
    }

    handleUpdateUserStakeLevel(userStakeLevel: UserStakeLevel) {
        console.log("[Dashboard] handleUpdateUserStakeLevel called with:", userStakeLevel);
        this.setState({ userStakeLevel });
    }

    showApiErrorMessage(errorCode: string) {
        console.log("[Dashboard] showApiErrorMessage called with errorCode:", errorCode);
        this.setState({ isShowErrorModal: true, isBlockUI: false, apiError: { errorCode, message: GetLocalizedErrorMessage(errorCode) } });
    }

    closeDialog() {
        console.log("[Dashboard] closeDialog called");
        this.setState({ isShowErrorModal: false });
        this.notificationHandler.isKickOut && this.signOut();
    }

    openGame(gameId: number) {
        console.log("[Dashboard] openGame called with gameId:", gameId);
        this.setState({ queryGame: gameId, openGameId: gameId });
        updateURLContext({ gameId });
    }

    renderGames() {
        console.log("[Dashboard] renderGames called");
        const { userStakeLevel, openGameName } = this.state;
        const urlContext = loadURLContext();

        console.log("[Dashboard] rendering games with:", { userStakeLevel, openGameName, urlContext });

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

    setDashBoardStyle(isRenderGames: boolean) {
        return isDesktop && isRenderGames ? { height: this.state.dashBoardHeight } : {};
    }

    renderDashBoard() {
        console.log("[Dashboard] renderDashBoard called");

        window.history.pushState(null, null, "/");

        const { isShowErrorModal, authorizeInfo, isBlockUI, openGameId } = this.state;
        const offerGames = this.dashboardHandler.getOfferGamesIds();
        const isRenderGames = true; // Custom version: Always render games

        console.log("[Dashboard] renderDashBoard state:", { isShowErrorModal, isBlockUI, openGameId, offerGames, isRenderGames });

        const isNoGameOffer = this.state.apiError?.message === ErrorNoGameOffer;
        const renderOfferGameContainer = () => this.renderGames(); // Custom version: Always render games

        const authContextValue = {
            authorizeInfo: authorizeInfo,
            session: this.props.session,
            setBalance: this.updateUserBalance,
            signOut: this.signOut,
            fractionalOddsFormat: authorizeInfo.user?.fractionalOddsFormat ?? false,
            enableQuickBet: true,
            locale: this.props.tolgee.getLanguage(),
        };

        console.log("[Dashboard] authContextValue:", authContextValue);

        return (
            <PlayerContextProvider value={authContextValue}>
                <SettingContextProvider>
                    <div id={"dashboard"}>
                        <Header />
                        <SoundSettings />

                        {isNoGameOffer ? <></> : renderOfferGameContainer()}

                        {<MusicPlayer />}

                        {isShowErrorModal && (
                            <div className={Styles["container-modal"]}>
                                <div className={`${Styles["bg-opacity"]} ${isBlockUI ? Styles["block-ui-backdrop"] : ""}`}></div>
                                <BaseDialog
                                    type={ModalType.Center}
                                    isOpen={isShowErrorModal}
                                    onCloseModal={this.closeDialog}
                                    isBlockUI={isBlockUI}
                                >
                                    <div className={`modal-center red-color ${isBlockUI ? Styles["block-ui-message"] : ""}`}>
                                        {!isBlockUI && <div className={`icon-close modal-icon-close`} onClick={this.closeDialog}></div>}
                                        <ErrorApiText
                                            errorMessage={this.state.apiError?.message}
                                            errorCode={this.state.apiError?.errorCode}
                                        />
                                    </div>
                                </BaseDialog>
                            </div>
                        )}
                    </div>
                </SettingContextProvider>
            </PlayerContextProvider>
        );
    }

    render() {
        console.log("[Dashboard] render called, isLandscapeMode:", this.state.isLandscapeMode);
        if (this.state.isLandscapeMode && isMobileOnly) {
            console.log("[Dashboard] rendering LandscapeMode");
            return <LandscapeMode />;
        }

        console.log("[Dashboard] rendering Dashboard");
        return this.renderDashBoard();
    }
}

export default withRouter(Dashboard);
