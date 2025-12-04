import * as Sentry from "@sentry/nextjs";
import { WithRouterProps } from "next/dist/client/with-router";
import { NextRouter, useRouter } from "next/router";
import { memo, useContext, useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { getAppSettings } from "@shared/app-settings";
import { Themes, languageMapper, locales } from "@shared/constants";
import { AnalyticsHelper, StorageHelper, getRenderGameSettings, localStorageKeys, randomInteger } from "@shared/helpers";
import { getDefaultGameId } from "@shared/utils";
import PreloadResources from "@shared/helpers/preload-resources";
import { PlayerContextModel, URLContext, usePlayerContext } from "@shared/react-contexts";
import { useTranslator } from "@shared/react-hooks";
import { setSentryUser } from "@shared/sentry";
import { tolgee } from "@shared/tolgee";
import { authorize, createNickname, sso, verifySession } from "@shared/services/auth-service";
import { updateSignInSMStatus } from "@shared/services/user-setting-service";
import { MAX_AVATAR_ID } from "@shared/helpers/avatar-helper";
import NameGenerator from "@shared/helpers/name-generator";
import { getOperator } from "@shared/helpers/router-helper";
import SplashScreenGame from "./logo/splash-screen";

export type SplashScreenProps = WithRouterProps;
export type SplashScreenState = {
    locale: string;
    underMaintenance: boolean;
};

const UMPage = dynamic(() => import("../um-page"), { ssr: false });
const Dashboard = dynamic(() => import("../dashboard"), { ssr: false });

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
    const session = token ? sso(token, getAppSettings().appType) : verifySession();

    return session;
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
    const { token, language } = useContext(URLContext);

    const router = useRouter();
    const player = usePlayerContext();
    const operator = getOperator();
    const { t } = useTranslator();

    const [isUm, setIsUm] = useState(player?.session?.isUM);
    const [locale, setLocale] = useState<string>();

    const [currentGameId, setCurrentGameId] = useState<number>(-1);
    const [authorizeResponse, setAuthorizeResponse] = useState<AuthorizeResponse>(null);
    const [isRenderDashboard, setIsRenderDashboard] = useState<boolean>(false);
    const [isDoneLoadConfig, setIsDoneLoadConfig] = useState<boolean>(false);
    const [preloadProgress, setPreloadProgress] = useState<number>(0);

    const signOut = () => {
        router.push("timeout");
    };

    const handlePreloadProgress = (progress: number) => {
        setPreloadProgress(progress);
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

    // Initialize progress bar when component mounts
    useEffect(() => {
        setPreloadProgress(0);
    }, []);

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

            // Get default game ID from environment or fallback
            const defaultGameId = getDefaultGameId();

            let toLoadGameId = defaultGameId;

            // Check for URL path-based game ID (e.g., /game-159/)
            const urlPath = typeof window !== "undefined" ? window.location.pathname : "";
            const pathGameIdMatch = urlPath.match(/\/game-(\d+)/);
            if (pathGameIdMatch) {
                const pathGameId = parseInt(pathGameIdMatch[1]);

                // For dedicated servers, prioritize environment variable
                // For multi-game servers, prioritize URL path
                if (process.env.NEXT_PUBLIC_DEFAULT_GAME_ID) {
                    // Dedicated server: keep environment variable priority
                    toLoadGameId = defaultGameId;
                } else {
                    // Multi-game server: use URL path
                    toLoadGameId = pathGameId;
                }
            }

            // Check for URL query parameter gameId (fallback for external systems)
            if (typeof window !== "undefined") {
                const urlParams = new URLSearchParams(window.location.search);
                const queryGameId = urlParams.get("gameId");
                if (queryGameId && !isNaN(Number(queryGameId))) {
                    const parsedQueryGameId = Number(queryGameId);

                    // Only override if we don't have a path-based or environment-based game ID
                    if (!pathGameIdMatch && !process.env.NEXT_PUBLIC_DEFAULT_GAME_ID) {
                        toLoadGameId = parsedQueryGameId;
                    } else {
                    }
                }
            }

            // Validate if the gameId is available in the enabled games
            const enabledRenderGameSettings = getRenderGameSettings(authorizeInfo);

            // Bypass validation for known games (SeDie: 148, Plinko: 145, Plinko X: 159, Baccarat: 150) so we can deep-link even if not in lobby/offer
            const knownGameIds = [145, 148, 159, 150]; // Plinko, SeDie Multiplayer, Plinko X and Baccarat
            let isGameAvailable = knownGameIds.includes(toLoadGameId);

            if (!isGameAvailable) {
                isGameAvailable = enabledRenderGameSettings.some((game) => game.id === toLoadGameId);
            }

            // If game is not available, use default game
            if (!isGameAvailable) {
                toLoadGameId = getDefaultGameId();
            }

            setCurrentGameId(toLoadGameId);

            if (authorizeInfo) {
                setAuthorizeResponse(authorizeInfo);

                try {
                    await customStartup(session, lang, router, player, authorizeInfo);
                    setIsDoneLoadConfig(true);
                } catch (error) {
                    console.error("[SplashScreen] custom startup error:", error);
                    onStartupError(error);
                }
            } else {
            }
        };

        handleInitialization();
        // Intentional: run once on mount; values used are stable for the session
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (player?.session?.isUM || isUm) {
        return <UMPage data-testid="um-page" />;
    }

    if (isRenderDashboard) {
        return (
            <Dashboard
                data-testid="dashboard-component"
                session={player?.session}
                queryGame={currentGameId}
                setIsUm={setIsUm}
                tolgee={tolgee}
                authorizeResponse={authorizeResponse}
            />
        );
    }

    if (!locale) {
        return <></>;
    }

    return (
        <>
            <SplashScreenGame operator={operator} locale={locale} t={t} preloadProgress={preloadProgress} />
            {/* <LoggerControls className="fixed top-4 right-4 z-50" /> */}

            {isDoneLoadConfig && currentGameId >= 0 && (
                <PreloadResources
                    setIsDonePreload={() => setIsRenderDashboard(true)}
                    gameId={currentGameId}
                    onProgressUpdate={handlePreloadProgress}
                />
            )}
        </>
    );
};

export default memo(SplashScreen);
