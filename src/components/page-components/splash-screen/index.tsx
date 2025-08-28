import * as Sentry from "@sentry/nextjs";
import { WithRouterProps } from "next/dist/client/with-router";
import { NextRouter, useRouter } from "next/router";
import { memo, useContext, useEffect, useState } from "react";

import dynamic from "next/dynamic";
import Image from "next/image";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { getAppSettings } from "../../../_shared/app-settings";
import { Themes, buildVersion, languageMapper, locales, GameIds } from "../../../_shared/constants";
import { AnalyticsHelper, StorageHelper, getRenderGameSettings, localStorageKeys, randomInteger } from "../../../_shared/helpers";
import PreloadResources from "../../../_shared/helpers/preload-resources";
import { PlayerContextModel, URLContext, usePlayerContext } from "../../../_shared/react-contexts";
import { useTranslator } from "../../../_shared/react-hooks";
import { setSentryUser } from "../../../_shared/sentry";
import { tolgee } from "../../../_shared/tolgee";
import { authorize, createNickname, sso, verifySession } from "../../../services/auth-service";
import { updateSignInSMStatus } from "../../../services/user-setting-service";
import { MAX_AVATAR_ID } from "../../../_shared/helpers/avatar-helper";
import NameGenerator from "../../../_shared/helpers/name-generator";
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
    console.error("[SplashScreen] startup error:", error);
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
    const { gameId, token, language } = useContext(URLContext);

    const router = useRouter();
    const player = usePlayerContext();
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

            // Custom version: Always direct to specific game, default to SeDie if no valid gameId
            let toLoadGameId = gameId;

            // If no gameId provided or gameId is 0, use default SeDie game
            if (!toLoadGameId || toLoadGameId === 0) {
                toLoadGameId = GameIds.SeDieMultiplayer;
            }

            // Validate if the gameId is available in the enabled games
            const enabledRenderGameSettings = getRenderGameSettings(authorizeInfo);

            // Bypass validation for SeDie so we can deep-link even if not in lobby/offer
            let isGameAvailable = toLoadGameId === GameIds.SeDieMultiplayer;
            if (!isGameAvailable) {
                isGameAvailable = enabledRenderGameSettings.some((game) => game.id === toLoadGameId);
            }

            // If game is not available, use default SeDie game
            if (!isGameAvailable) {
                toLoadGameId = GameIds.SeDieMultiplayer;
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
                queryGame={currentGameId < 0 ? gameId : currentGameId}
                setIsUm={setIsUm}
                tolgee={tolgee}
                authorizeResponse={authorizeResponse}
            />
        );
    }

    return (
        <>
            <div className={Styles.page} data-testid="splash-screen">
                <div className={Styles["center"]}>
                    <div className={Styles["logo"]}>
                        <Image
                            src={`/static/images/splash-screen/2x/logo-sabaplay.png?v=${buildVersion}`}
                            width={195}
                            height={162}
                            alt="logo"
                            priority={true}
                        />
                    </div>

                    <div className={Styles["slogan"]} data-testid="splash-screen-slogan">
                        {locale && t("SabaNumber.splashscreen_slogan")}
                    </div>
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
                        {preloadProgress > 0 && preloadProgress < 100 && <span> ({Math.round(preloadProgress)}%)</span>}
                        {preloadProgress === 0 && isDoneLoadConfig && <span> (Initializing...)</span>}
                    </p>
                </div>
            </div>

            {isDoneLoadConfig && currentGameId >= 0 && (
                <>
                    <PreloadResources
                        data-testid="preload-resources"
                        setIsDonePreload={() => {
                            setIsRenderDashboard(true);
                        }}
                        gameId={currentGameId}
                        locale={locale}
                        onProgressUpdate={handlePreloadProgress}
                    />
                </>
            )}
        </>
    );
};

export default memo(SplashScreen);
