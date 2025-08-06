import * as Sentry from "@sentry/nextjs";
import { WithRouterProps } from "next/dist/client/with-router";
import { NextRouter, useRouter } from "next/router";
import { memo, useContext, useEffect, useState } from "react";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { getAppSettings } from "../../../_shared/app-settings";
import { Themes, buildVersion, languageMapper, locales } from "../../../_shared/constants";
import {
    AnalyticsHelper,
    StorageHelper,
    getEnabledRenderGameSettings,
    getServiceStatusIsAvailable,
    localStorageKeys,
    randomInteger,
    getUserLatestGameId,
} from "../../../_shared/helpers";
import PreloadResources, {
    DURATION_HOLD_SPLASH_SCREEN,
    getAndHandleGameOfferIds,
    getAndHandleBannerOffer as handleBannerOffer,
} from "../../../_shared/helpers/preload-resources";
import { PlayerContextModel, URLContext, usePlayerContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks";
import { setSentryUser } from "../../../_shared/sentry";
import { tolgee } from "../../../_shared/tolgee";
import { authorize, createNickname, getLobbyConfigs, sso, verifySession } from "../../../services/auth-service";
import { updateSignInSMStatus } from "../../../services/user-setting-service";
import { GameSettings } from "../../game-base/type";
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
    const isTimeout = !session || (!session?.isUM && !session?.isAuthenticated);
    player.locale = locale;
    if (isTimeout) {
        router.push("timeout");

        return;
    }

    if (session?.isAuthenticated) {
        setSentryUser(session);
        player.session = session;
        player.authorizeInfo = authorizeResponse;
        AnalyticsHelper.setUser(session.username);
    }
};

export function onStartupError(error: Error): void {
    Sentry.captureException(error);

    globalThis.location.pathname = "timeout";
}

const isTimeoutSession = (session: SSOResponse) => {
    return !session || (!session?.isUM && !session?.isAuthenticated);
};

const getSession = async (token: string) => {
    return token ? sso(token, getAppSettings().appType) : verifySession();
};

const autoCreateNickname = async (session: SSOResponse, signOut: Function) => {
    const nickname = NameGenerator.generateName();
    const maxAvatarId = MAX_AVATAR_ID;
    const selectedAvatarId = randomInteger(1, maxAvatarId);
    const authorizeResponse = (await createNickname(session, nickname, selectedAvatarId)) as AuthorizeResponse;
    if (authorizeResponse?.authorized) {
        Object.assign(authorizeResponse.user, { settings: { theme: Themes.light } });
        authorizeResponse.user.isSignedInSM = true;
        updateSignInSMStatus(session);
    } else {
        signOut?.();
    }

    return authorizeResponse;
};

const SplashScreen: React.FC = () => {
    const { gameId, isDirectMode, token, language, firstSSOToLobby, isSabaPlay } = useContext(URLContext);

    const router = useRouter();
    const player = usePlayerContext();
    const { t } = useTranslator();

    // Use user-specific latestGameId instead of global one
    const latestGameId = getUserLatestGameId(player?.session?.username) || 0;

    const [isUm, setIsUm] = useState(player?.session?.isUM);
    const [bannerId, setBannerId] = useState<number>(0);
    const [locale, setLocale] = useState<string>();

    const [gameOfferIds, setGameOfferIds] = useState<number[]>([]);
    const [currentGameId, setCurrentGameId] = useState<number>(-1);
    const [authorizeResponse, setAuthorizeResponse] = useState<AuthorizeResponse>(null);
    const [lobbyConfigs, setLobbyConfigs] = useState<ILobbyConfigs>(null);
    const [isRenderDashboard, setIsRenderDashboard] = useState<boolean>(false);
    const [isDoneLoadConfig, setIsDoneLoadConfig] = useState<boolean>(false);

    const signOut = () => {
        router.push("timeout");
    };

    const handleUM = (session: SSOResponse) => {
        StorageHelper.set(localStorageKeys.umInfo, session.umInfo);
        player.session = session;
        setIsUm(true);
    };

    const loadLanguage = async (session: SSOResponse) => {
        const lang = languageMapper[session?.language] || languageMapper[language] || locales.en;
        await tolgee.changeLanguage(lang);
        setLocale(lang);
        return lang;
    };

    const loadLobbyConfigs = async (session: SSOResponse, authorizeInfo: any) => {
        const lobby = await getLobbyConfigs(session);
        if (!lobby || Object.keys(lobby.lobbyConfigs).length === 0) {
            return null;
        }
        if (lobby?.lobbyConfigs) {
            setLobbyConfigs(lobby.lobbyConfigs as any);
            handleBannerOffer(authorizeInfo, lobby.lobbyConfigs, setBannerId);
            getAndHandleGameOfferIds(authorizeInfo, lobby.lobbyConfigs, setGameOfferIds);
        }
        return lobby?.lobbyConfigs;
    };

    useEffect(() => {
        let authorizeInfo;
        const handleInitialization = async () => {
            const session = await getSession(token);

            const lang = await loadLanguage(session);

            if (!session || isTimeoutSession(session)) {
                signOut();
                return;
            }

            if (session?.isUM) {
                handleUM(session);
                return;
            }

            authorizeInfo = await authorize(session);

            if (authorizeInfo.errorCode === "SB0002") {
                signOut();
                return;
            }

            if (!authorizeInfo?.authorized) {
                authorizeInfo = await autoCreateNickname(session, signOut);
                if (!authorizeInfo?.authorized) {
                    signOut();
                    return;
                }
            }

            const lobbyConfigs = await loadLobbyConfigs(session, authorizeInfo);

            // Custom version: Always direct to specific game, default to 1005 if no valid gameId
            let toLoadGameId = gameId;
            
            // If no gameId provided or gameId is 0, use default game 1005
            if (!toLoadGameId || toLoadGameId === 0) {
                toLoadGameId = 1005;
            }
            
            // Validate if the gameId is available in the enabled games
            const enabledRenderGameSettings = getEnabledRenderGameSettings(lobbyConfigs as any, authorizeInfo);
            const isGameAvailable = enabledRenderGameSettings.some(game => game.id === toLoadGameId);
            
            // If game is not available, use default game 1005
            if (!isGameAvailable) {
                toLoadGameId = 1005;
            }

            setCurrentGameId(toLoadGameId);

            if (authorizeInfo) {
                setAuthorizeResponse(authorizeInfo);

                try {
                    await customStartup(session, lang, router, player, authorizeInfo);
                    setIsDoneLoadConfig(true);
                } catch (error) {
                    onStartupError(error);
                }
            }
        };

        handleInitialization();
    }, []);



    if (player?.session?.isUM || isUm) {
        return <UMPage data-testid="um-page" />;
    }

    if (isRenderDashboard) {
        document.body.classList.add("galaxy-bg");
        return (
            <Dashboard
                data-testid="dashboard-component"
                session={player?.session}
                queryGame={currentGameId < 0 ? gameId : currentGameId}
                setIsUm={setIsUm}
                directMode={isDirectMode}
                tolgee={tolgee}
                authorizeResponse={authorizeResponse}
                lobbyConfigs={lobbyConfigs}
            />
        );
    }



    const logoProps = {
        postfix: isSabaPlay ? `-sabaplay` : ``,
        width: isSabaPlay ? 173 : 195,
        height: isSabaPlay ? 205 : 162,
    };
    return (
        <>
            <div className={`${Styles.page} ${isSabaPlay ? Styles.sabaPlayBg : ''}`} data-testid="splash-screen">
                <div className={Styles["center"]}>
                    <div className={Styles["logo"]}>
                        <Image
                            src={`/static/images/splash-screen/2x/logo${logoProps.postfix}.png?v=${buildVersion}`}
                            width={logoProps.width}
                            height={logoProps.height}
                            alt="logo"
                            priority={true}
                        />
                        {isSabaPlay && locale && (
                            <>
                                <div className={Styles["slogan-image"]}>
                                    <Image
                                        src={`/static/images/splash-screen/slogan-sabaplay/slogan-sabaplay-${locale}.webp?v=${buildVersion}`}
                                        width={354}
                                        height={46}
                                        alt="slogan"
                                        priority={true}
                                    />
                                </div>
                                <div className={Styles["loading-bar-sabaplay"]}>
                                    <Image
                                        src={`/static/images/splash-screen/loading-bar-sabaplay.gif?v=${buildVersion}`}
                                        width={108}
                                        height={6}
                                        alt="loading"
                                        priority={true}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {!isSabaPlay && (
                        <div className={Styles["slogan"]} data-testid="splash-screen-slogan">{locale && t("SabaNumber.splashscreen_slogan")}</div>
                    )}
                </div>

                {!isSabaPlay && (
                    <div className={"loading"}>
                        <div className={"progress"}>
                            <div className={"progress-bar"} id="progress-bar" data-testid="progress-bar"></div>
                        </div>
                        <p className={"text-first-download"} data-testid="download-message">{locale && t("Common.message_download_first_visit")}</p>
                    </div>
                )}
            </div>

            {isDoneLoadConfig && currentGameId >= 0 && (
                <PreloadResources
                    data-testid="preload-resources"
                    bannerId={bannerId}
                    setIsDonePreload={() => {
                        setIsRenderDashboard(true);
                    }}
                    gameId={currentGameId}
                    isDirectMode={isDirectMode}
                    locale={locale}
                    gameIdsIcon={gameOfferIds}
                    durationDelayDonePreload={DURATION_HOLD_SPLASH_SCREEN}
                />
            )}
        </>
    );
};

export default memo(SplashScreen);
