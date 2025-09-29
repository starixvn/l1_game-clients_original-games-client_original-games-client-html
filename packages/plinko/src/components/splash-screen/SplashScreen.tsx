import React, { useContext, useEffect, useState, memo } from "react";
import { WithRouterProps } from "next/dist/client/with-router";
import { NextRouter, useRouter } from "next/router";
import dynamic from "next/dynamic";

import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { getAppSettings } from '@shared/app-settings';
import { Themes, languageMapper, locales } from '@shared/constants';
import { AnalyticsHelper, StorageHelper, getRenderGameSettings, localStorageKeys, randomInteger } from '@shared/helpers';
import { getDefaultGameId } from '@shared/utils';
import PreloadResources from '@shared/helpers/preload-resources';
import { PlayerContextModel, URLContext, usePlayerContext } from '@shared/react-contexts';
import { useTranslator } from '@shared/react-hooks';
import { setSentryUser } from '@shared/sentry';
import { tolgee } from '@shared/tolgee';
import { authorize, createNickname, sso, verifySession } from '@shared/services/auth-service';
import { updateSignInSMStatus } from '@shared/services/user-setting-service';
import { MAX_AVATAR_ID } from '@shared/helpers/avatar-helper';
import NameGenerator from '@shared/helpers/name-generator';
import { logger } from '@shared/services/logger';
import { logger as plinkoLogger } from '../services/logger';
import Styles from "./splash-screen.module.scss";
import FadeContent from "./fade-content";
import LoggerControls from "../ui/components/controls/LoggerControls";

export type SplashScreenProps = WithRouterProps;
export type SplashScreenState = {
    locale: string;
    underMaintenance: boolean;
};

const UMPage = dynamic(() => import("../um-page/UmPage"), { ssr: false });
const Dashboard = dynamic(() => import("../dashboard/Dashboard"), { ssr: false });

export const customStartup = async (
    session: SSOResponse,
    locale: string,
    router: NextRouter,
    player: PlayerContextModel,
    authorizeResponse: any
): Promise<void> => {
    plinkoLogger.info('🚀 [SPLASH] Custom startup initiated', {
        hasSession: !!session,
        isAuthenticated: session?.isAuthenticated,
        isUM: session?.isUM,
        locale,
        hasAuthorizeResponse: !!authorizeResponse,
        username: session?.username
    });

    const isTimeout = !session || (!session?.isUM && !session?.isAuthenticated);
    player.locale = locale;

    plinkoLogger.debug('🔍 [SPLASH] Session validation', {
        isTimeout,
        sessionValid: !!session,
        isUM: session?.isUM,
        isAuthenticated: session?.isAuthenticated
    });

    if (isTimeout) {
        plinkoLogger.warn('⏰ [SPLASH] Session timeout detected, redirecting to timeout page');
        router.push("timeout");
        return;
    }

    if (session?.isAuthenticated) {
        plinkoLogger.info('✅ [SPLASH] User authenticated, setting up user context', {
            username: session.username,
            hasAuthorizeResponse: !!authorizeResponse
        });

        setSentryUser(session);
        player.session = session;
        player.authorizeInfo = authorizeResponse;
        AnalyticsHelper.setUser(session.username);

        plinkoLogger.info('🎯 [SPLASH] User context setup completed', {
            username: session.username,
            locale: player.locale,
            hasSession: !!player.session,
            hasAuthorizeInfo: !!player.authorizeInfo
        });
    }
};

export function onStartupError(error: Error): void {
    plinkoLogger.error('❌ [SPLASH] Startup error occurred', {
        error: error.message,
        stack: error.stack
    });
    console.error('SplashScreen startup error:', error);
}

const autoCreateNickname = async (userSession: SSOResponse): Promise<AuthorizeResponse> => {
    plinkoLogger.info('🎭 [SPLASH] Auto-creating nickname for user', {
        username: userSession.username
    });

    try {
        const nickname = NameGenerator.generate();
        const avatarId = randomInteger(1, MAX_AVATAR_ID);

        plinkoLogger.debug('🎭 [SPLASH] Generated nickname and avatar', {
            nickname,
            avatarId
        });

        const authorizeResponse = await createNickname(userSession, nickname, avatarId);

        plinkoLogger.info('✅ [SPLASH] Nickname created successfully', {
            username: userSession.username,
            nickname,
            avatarId
        });

        return authorizeResponse;
    } catch (error) {
        plinkoLogger.error('❌ [SPLASH] Failed to create nickname', {
            error: error.message,
            username: userSession.username
        });
        throw error;
    }
};

const SplashScreen: React.FC = () => {
    const { token, language } = useContext(URLContext);

    plinkoLogger.info('🎬 [SPLASH] SplashScreen component initialized', {
        hasToken: !!token,
        tokenLength: token?.length,
        language,
        timestamp: new Date().toISOString()
    });

    console.log("[SplashScreen] URL Context values:", { token, language });
    console.log("[SplashScreen] Loading game registry...");

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

    plinkoLogger.debug('📊 [SPLASH] Component state initialized', {
        isUm: player?.session?.isUM,
        currentGameId: -1,
        isRenderDashboard: false,
        isDoneLoadConfig: false,
        preloadProgress: 0
    });

    const signOut = () => {
        plinkoLogger.warn('🚪 [SPLASH] User signing out, redirecting to timeout');
        router.push("timeout");
    };

    const handlePreloadProgress = (progress: number) => {
        plinkoLogger.debug('📈 [SPLASH] Preload progress updated', { progress });
        setPreloadProgress(progress);
    };

    const handleUM = (session: SSOResponse) => {
        plinkoLogger.info('👑 [SPLASH] Handling UM (User Management) session', {
            hasUmInfo: !!session.umInfo,
            username: session.username
        });
        StorageHelper.set(localStorageKeys.umInfo, session.umInfo);
        player.session = session;
        setIsUm(true);
    };

    const loadLanguage = async (session: SSOResponse) => {
        plinkoLogger.info('🌐 [SPLASH] Loading language configuration', {
            sessionLanguage: session.language,
            contextLanguage: language,
            hasSession: !!session
        });

        const selectedLanguage = languageMapper(session.language, language);
        plinkoLogger.debug('🌐 [SPLASH] Language mapping result', {
            selectedLanguage,
            sessionLanguage: session.language,
            contextLanguage: language,
            fallbackLanguage: locales.en
        });

        try {
            await tolgee.loadLanguage(selectedLanguage);
            plinkoLogger.info('✅ [SPLASH] Language loaded successfully', {
                locale: selectedLanguage
            });
            setLocale(selectedLanguage);
            return selectedLanguage;
        } catch (error) {
            plinkoLogger.error('❌ [SPLASH] Failed to load language', {
                error: error.message,
                selectedLanguage
            });
            throw error;
        }
    };

    const initializeHandler = async () => {
        plinkoLogger.info('🎬 [SPLASH] Starting initialization handler');

        plinkoLogger.info('🚀 [SPLASH] Starting initialization process', {
            hasToken: !!token,
            timestamp: new Date().toISOString()
        });

        try {
            plinkoLogger.info('🔐 [SPLASH] Getting session', {
                hasToken: !!token,
                tokenLength: token?.length,
                appType: 10
            });

            const session = await sso(token, 10);

            plinkoLogger.info('🔐 [SPLASH] Session retrieved', {
                hasSession: !!session,
                isAuthenticated: session?.isAuthenticated,
                isUM: session?.isUM,
                username: session?.username
            });

            if (session?.isUM) {
                handleUM(session);
                return;
            }

            const loadedLocale = await loadLanguage(session);

            plinkoLogger.info('🔑 [SPLASH] Starting authorization process');
            const authorizeResponse = await authorize(session);

            plinkoLogger.info('🔑 [SPLASH] Authorization result', {
                authorized: !!authorizeResponse,
                hasUser: !!authorizeResponse?.user
            });

            plinkoLogger.info('🎮 [SPLASH] Game configuration started', {
                defaultGameId: 145 // Plinko game ID
            });

            const gameId = getDefaultGameId() || 145;
            setCurrentGameId(gameId);
            setIsDoneLoadConfig(true);

            plinkoLogger.info('🎮 [SPLASH] Game configuration completed', {
                gameId,
                isDoneLoadConfig: true,
                currentGameId: gameId,
                hasSession: !!session,
                hasAuthorizeResponse: !!authorizeResponse
            });

            await customStartup(session, loadedLocale, router, player, authorizeResponse);
            setAuthorizeResponse(authorizeResponse);

        } catch (error) {
            plinkoLogger.error('❌ [SPLASH] Initialization failed', {
                error: error.message,
                stack: error.stack
            });
            onStartupError(error);
        }
    };

    useEffect(() => {
        if (token) {
            initializeHandler();
        }
    }, [token]);

    // Logo component for Plinko
    const Logo = () => (
        <div className={Styles.logo}>
            <h1>PLINKO</h1>
            <div className={Styles.logoSubtitle}>Original Games</div>
        </div>
    );

    if (isUm) {
        plinkoLogger.info('👑 [SPLASH] Rendering UM page', {
            hasUmInfo: !!player?.session?.umInfo
        });
        return <UMPage data-testid="um-page" />;
    }

    if (isRenderDashboard) {
        plinkoLogger.info('🏠 [SPLASH] Rendering dashboard', {
            currentGameId,
            hasSession: !!player?.session,
            hasAuthorizeResponse: !!authorizeResponse
        });
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

    plinkoLogger.debug('🎨 [SPLASH] Rendering splash screen UI', {
        locale,
        preloadProgress,
        isDoneLoadConfig,
        currentGameId,
        hasLocale: !!locale
    });

    return (
        <>
            <div className={Styles.page} data-testid="splash-screen">
                <FadeContent blur={true} duration={200} easing="ease-out" initialOpacity={0}>
                    <div className={Styles["center"]}>
                        <div className={`${Styles["logo"]}`}>
                            <Logo />
                        </div>
                        <div className={Styles["slogan"]} data-testid="splash-screen-slogan">
                            {locale && t("Common.original_tagline")}
                        </div>
                    </div>
                </FadeContent>

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
                        {preloadProgress > 0 && preloadProgress < 100 && <span> ({Math.floor(preloadProgress)}%)</span>}
                        {preloadProgress === 0 && isDoneLoadConfig && <span> (Initializing...)</span>}
                    </p>
                </div>
            </div>

            <LoggerControls className="fixed top-4 right-4 z-50" />

            {isDoneLoadConfig && currentGameId >= 0 && (
                <>
                    {plinkoLogger.info('📦 [SPLASH] Starting resource preloading', {
                        gameId: currentGameId,
                        isDoneLoadConfig,
                        preloadProgress
                    })}
                    <PreloadResources
                        data-testid="preload-resources"
                        setIsDonePreload={() => {
                            plinkoLogger.info('✅ [SPLASH] Resource preloading completed, rendering dashboard');
                            setIsRenderDashboard(true);
                        }}
                        gameId={currentGameId}
                        onProgressUpdate={handlePreloadProgress}
                    />
                </>
            )}
        </>
    );
};

export default memo(SplashScreen);
