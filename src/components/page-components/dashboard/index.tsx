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
        const authorizeInfo = { ...this.state.authorizeInfo };
        if (authorizeInfo.user.red !== balance) {
            authorizeInfo.user.red = balance;
            GlobalMessageTransmitter.broadcast({ [GlobalTransmitterEvent.USER_INFO_RED]: authorizeInfo.user.red });
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
            if (this.dashboardHandler.checkIsNotOfferGame()) {
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
        unsubscribeGlobalMessageEvent(this.backToLobbyEventId);
        document.removeEventListener("visibilitychange", this.onVisibilityChange);

        this.notificationHandler.reset();
        this.dashboardHandler.reset();
    }

    signOut() {
        this.props.router.push("/timeout", "/timeout", { locale: this.props.tolgee.getLanguage() });
    }

    handleUpdateUserStakeLevel(userStakeLevel: UserStakeLevel) {
        this.setState({ userStakeLevel });
    }

    showApiErrorMessage(errorCode: string) {
        this.setState({ isShowErrorModal: true, isBlockUI: false, apiError: { errorCode, message: GetLocalizedErrorMessage(errorCode) } });
    }

    closeDialog() {
        this.setState({ isShowErrorModal: false });
        this.notificationHandler.isKickOut && this.signOut();
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

    setDashBoardStyle(isRenderGames: boolean) {
        return isDesktop && isRenderGames ? { height: this.state.dashBoardHeight } : {};
    }

    renderDashBoard() {

        window.history.pushState(null, null, "/");

        const { isShowErrorModal, authorizeInfo, isBlockUI, openGameId } = this.state;
        const offerGames = this.dashboardHandler.getOfferGamesIds();
        const isRenderGames = true; // Custom version: Always render games

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
        if (this.state.isLandscapeMode && isMobileOnly) {
            return <LandscapeMode />;
        }

        return this.renderDashBoard();
    }
}

export default withRouter(Dashboard);
