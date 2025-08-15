import * as Sentry from "@sentry/nextjs";
import { WithRouterProps } from "next/dist/client/with-router";
import { NextRouter, useRouter } from "next/router";
import { memo, useContext, useEffect, useState } from "react";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { getAppSettings } from "../../../_shared/app-settings";
import { Themes, buildVersion, languageMapper, locales, GameIds } from "../../../_shared/constants";
import {
    AnalyticsHelper,
    StorageHelper,
    getEnabledRenderGameSettings,
    localStorageKeys,
    randomInteger,
} from "../../../_shared/helpers";
import PreloadResources, {
    getAndHandleGameOfferIds,
    getAndHandleBannerOffer as handleBannerOffer,
} from "../../../_shared/helpers/preload-resources";
import { PlayerContextModel, URLContext, usePlayerContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks";
import { setSentryUser } from "../../../_shared/sentry";
import { tolgee } from "../../../_shared/tolgee";
import { authorize, createNickname, getLobbyConfigs, sso, verifySession } from "../../../services/auth-service";
import { updateSignInSMStatus } from "../../../services/user-setting-service";
import { MAX_AVATAR_ID } from "../../../_shared/helpers/avatar-helper";
import NameGenerator from "../../../_shared/helpers/name-generator";
import { ILobbyConfigs } from "../dashboard/type";
import Styles from "./splash-screen.module.scss";

export type SplashScreenProps = WithRouterProps;
export type SplashScreenState = {
    locale: string;
    underMaintenance: boolean;
};

const UMPage = dynamic(() => import("../um-page"));

const Dashboard = dynamic(() => import("../dashboard"));

export const customStartup = async (
    session: SSOResponse,
    locale: string,
    router: NextRouter,
    player: PlayerContextModel,
    authorizeResponse: any
): Promise<void> => {
    console.log("[SplashScreen] customStartup called with:", {
        session: !!session,
        locale,
        isAuthenticated: session?.isAuthenticated
    });
    const isTimeout = !session || (!session?.isUM && !session?.isAuthenticated);
    player.locale = locale;
    if (isTimeout) {
        console.log("[SplashScreen] timeout detected, redirecting to timeout page");
        router.push("timeout");

        return;
    }

    if (session?.isAuthenticated) {
        console.log("[SplashScreen] session authenticated, setting up user");
        setSentryUser(session);
        player.session = session;
        player.authorizeInfo = authorizeResponse;
        AnalyticsHelper.setUser(session.username);
    }
};

export function onStartupError(error: Error): void {
    console.error("[SplashScreen] startup error:", error);
    Sentry.captureException(error);

    globalThis.location.pathname = "timeout";
}

const isTimeoutSession = (session: SSOResponse) => {
    const isTimeout = !session || (!session?.isUM && !session?.isAuthenticated);
    console.log("[SplashScreen] isTimeoutSession:", isTimeout);
    return isTimeout;
};

const getSession = async (token: string) => {
    console.log("[SplashScreen] getSession called with token:", !!token);
    const session = token ? sso(token, getAppSettings().appType) : verifySession();
    console.log("[SplashScreen] session result:", !!session);
    return session;
};

const autoCreateNickname = async (session: SSOResponse, signOut: Function) => {
    console.log("[SplashScreen] autoCreateNickname called");
    const nickname = NameGenerator.generateName();
    const maxAvatarId = MAX_AVATAR_ID;
    const selectedAvatarId = randomInteger(1, maxAvatarId);
    console.log("[SplashScreen] generated nickname:", nickname, "avatarId:", selectedAvatarId);
    const authorizeResponse = (await createNickname(session, nickname, selectedAvatarId)) as AuthorizeResponse;
    if (authorizeResponse?.authorized) {
        console.log("[SplashScreen] nickname created successfully");
        Object.assign(authorizeResponse.user, { settings: { theme: Themes.light } });
        authorizeResponse.user.isSignedInSM = true;
        updateSignInSMStatus(session);
    } else {
        console.log("[SplashScreen] nickname creation failed, signing out");
        signOut?.();
    }

    return authorizeResponse;
};

const SplashScreen: React.FC = () => {
    console.log("[SplashScreen] SplashScreen component rendering");
    const { gameId, token, language } = useContext(URLContext);

    const router = useRouter();
    const player = usePlayerContext();
    const { t } = useTranslator();

    // latestGameId deprecated; keep variable for logs/backward compatibility always 0
    const latestGameId = 0;

    console.log("[SplashScreen] initial context:", { gameId, token: !!token, language, latestGameId });

    const [isUm, setIsUm] = useState(player?.session?.isUM);
    const [bannerId, setBannerId] = useState<number>(0);
    const [locale, setLocale] = useState<string>();

    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);
    const [currentGameId, setCurrentGameId] = useState<number>(-1);
    const [authorizeResponse, setAuthorizeResponse] = useState<AuthorizeResponse>(null);
    const [lobbyConfigs, setLobbyConfigs] = useState<ILobbyConfigs>(null);
    const [isRenderDashboard, setIsRenderDashboard] = useState<boolean>(false);
    const [isDoneLoadConfig, setIsDoneLoadConfig] = useState<boolean>(false);
    const [preloadProgress, setPreloadProgress] = useState<number>(0);

    console.log("[SplashScreen] state:", {
        isUm,
        currentGameId,
        isRenderDashboard,
        isDoneLoadConfig,
        preloadProgress,
        authorizeResponse: !!authorizeResponse,
        lobbyConfigs: !!lobbyConfigs
    });

    const signOut = () => {
        console.log("[SplashScreen] signOut called");
        router.push("timeout");
    };

    const handlePreloadProgress = (progress: number) => {
        console.log("[SplashScreen] Preload progress update:", progress);
        setPreloadProgress(progress);
    };

    const handleUM = (session: SSOResponse) => {
        console.log("[SplashScreen] handleUM called");
        StorageHelper.set(localStorageKeys.umInfo, session.umInfo);
        player.session = session;
        setIsUm(true);
    };

    const loadLanguage = async (session: SSOResponse) => {
        console.log("[SplashScreen] loadLanguage called");
        const lang = languageMapper[session?.language] || languageMapper[language] || locales.en;
        console.log("[SplashScreen] selected language:", lang);
        await tolgee.changeLanguage(lang);
        setLocale(lang);
        return lang;
    };

    const loadLobbyConfigs = async (session: SSOResponse, authorizeInfo: any) => {
        console.log("[SplashScreen] loadLobbyConfigs called");
        const lobby = await getLobbyConfigs(session);
        if (!lobby || Object.keys(lobby.lobbyConfigs).length === 0) {
            console.log("[SplashScreen] no lobby configs found");
            return null;
        }
        if (lobby?.lobbyConfigs) {
            console.log("[SplashScreen] lobby configs loaded");
            setLobbyConfigs(lobby.lobbyConfigs as any);
            handleBannerOffer(authorizeInfo, lobby.lobbyConfigs, setBannerId);
            getAndHandleGameOfferIds(authorizeInfo, lobby.lobbyConfigs, setGameOfferIds);
        }
        return lobby?.lobbyConfigs;
    };

    // Initialize progress bar when component mounts
    useEffect(() => {
        setPreloadProgress(0);
    }, []);

    useEffect(() => {
        let authorizeInfo;
        const handleInitialization = async () => {
            console.log("[SplashScreen] handleInitialization started");
            const session = await getSession(token);

            const lang = await loadLanguage(session);

            if (!session || isTimeoutSession(session)) {
                console.log("[SplashScreen] session timeout, signing out");
                signOut();
                return;
            }

            if (session?.isUM) {
                console.log("[SplashScreen] session is UM, handling UM");
                handleUM(session);
                return;
            }

            console.log("[SplashScreen] authorizing session");
            authorizeInfo = await authorize(session);

            if (authorizeInfo.errorCode === "SB0002") {
                console.log("[SplashScreen] authorization error SB0002, signing out");
                signOut();
                return;
            }

            if (!authorizeInfo?.authorized) {
                console.log("[SplashScreen] not authorized, creating nickname");
                authorizeInfo = await autoCreateNickname(session, signOut);
                if (!authorizeInfo?.authorized) {
                    console.log("[SplashScreen] nickname creation failed, signing out");
                    signOut();
                    return;
                }
            }

            const lobbyConfigs = await loadLobbyConfigs(session, authorizeInfo);

            // Custom version: Always direct to specific game, default to SeDie if no valid gameId
            let toLoadGameId = gameId;

            // If no gameId provided or gameId is 0, use default SeDie game
            if (!toLoadGameId || toLoadGameId === 0) {
                console.log("[SplashScreen] no gameId provided, using default SeDie");
                toLoadGameId = GameIds.SeDieMultiplayer;
            }

            // Validate if the gameId is available in the enabled games
            const enabledRenderGameSettings = getEnabledRenderGameSettings(lobbyConfigs as any, authorizeInfo);

            // Bypass validation for SeDie so we can deep-link even if not in lobby/offer
            let isGameAvailable = toLoadGameId === GameIds.SeDieMultiplayer;
            if (!isGameAvailable) {
                isGameAvailable = enabledRenderGameSettings.some(game => game.id === toLoadGameId);
            }

            console.log("[SplashScreen] game validation:", {
                toLoadGameId,
                enabledGames: enabledRenderGameSettings.map(g => g.id),
                isGameAvailable
            });

            // If game is not available, use default SeDie game
            if (!isGameAvailable) {
                console.log("[SplashScreen] game not available, using default SeDie");
                toLoadGameId = GameIds.SeDieMultiplayer;
            }

            console.log("[SplashScreen] final gameId to load:", toLoadGameId);
            setCurrentGameId(toLoadGameId);

            if (authorizeInfo) {
                console.log("[SplashScreen] setting authorize response");
                setAuthorizeResponse(authorizeInfo);

                try {
                    await customStartup(session, lang, router, player, authorizeInfo);
                    console.log("[SplashScreen] custom startup completed");
                    setIsDoneLoadConfig(true);
                } catch (error) {
                    console.error("[SplashScreen] custom startup error:", error);
                    onStartupError(error);
                }
            }
        };

        handleInitialization();
        // Intentional: run once on mount; values used are stable for the session
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (player?.session?.isUM || isUm) {
        console.log("[SplashScreen] rendering UMPage");
        return <UMPage data-testid="um-page" />;
    }

    if (isRenderDashboard) {
        console.log("[SplashScreen] rendering Dashboard");
        document.body.classList.add("galaxy-bg");
        return (
            <Dashboard
                data-testid="dashboard-component"
                session={player?.session}
                queryGame={currentGameId < 0 ? gameId : currentGameId}
                setIsUm={setIsUm}
                tolgee={tolgee}
                authorizeResponse={authorizeResponse}
                lobbyConfigs={lobbyConfigs}
            />
        );
    }

    console.log("[SplashScreen] rendering splash screen UI");
    return (
        <>
            <div className={Styles.page} data-testid="splash-screen">
                <div className={Styles["center"]}>
                    <div className={Styles["logo"]}>
                        <Image
                            src={`/static/images/splash-screen/2x/logo.png?v=${buildVersion}`}
                            width={195}
                            height={162}
                            alt="logo"
                            priority={true}
                        />
                    </div>

                    <div className={Styles["slogan"]} data-testid="splash-screen-slogan">{locale && t("SabaNumber.splashscreen_slogan")}</div>
                </div>

                <div className={"loading"}>
                    <div className={"progress"}>
                        <div
                            className={"progress-bar"}
                            id="progress-bar"
                            data-testid="progress-bar"
                            style={{ width: `${preloadProgress}%` }}
                        ></div>
                    </div>
                    <p className={"text-first-download"} data-testid="download-message">
                        {locale && t("Common.message_download_first_visit")}
                        {preloadProgress > 0 && preloadProgress < 100 && (
                            <span> ({Math.round(preloadProgress)}%)</span>
                        )}
                        {preloadProgress === 0 && isDoneLoadConfig && (
                            <span> (Initializing...)</span>
                        )}
                    </p>
                </div>
            </div>

            {isDoneLoadConfig && currentGameId >= 0 && (
                <>
                    {console.log("[SplashScreen] Rendering PreloadResources with:", {
                        currentGameId,
                        bannerId,
                        locale,
                        gameOfferIds: gameOfferIds?.length || 0,
                        isDoneLoadConfig
                    })}
                    <PreloadResources
                        data-testid="preload-resources"
                        bannerId={bannerId}
                        setIsDonePreload={() => {
                            console.log("[SplashScreen] PreloadResources completed, setting isRenderDashboard to true");
                            setIsRenderDashboard(true);
                        }}
                        gameId={currentGameId}
                        locale={locale}
                        gameIdsIcon={gameOfferIds}
                        onProgressUpdate={handlePreloadProgress}
                    />
                </>
            )}
        </>
    );
};

export default memo(SplashScreen);
