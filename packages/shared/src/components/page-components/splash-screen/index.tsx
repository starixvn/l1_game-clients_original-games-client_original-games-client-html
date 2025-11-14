import * as Sentry from "@sentry/nextjs";
import { WithRouterProps } from "next/dist/client/with-router";
import { NextRouter, useRouter } from "next/router";
import { memo, useContext, useEffect, useState } from "react";

import dynamic from "next/dynamic";
import { AuthorizeResponse, SSOResponse } from "sc-user-service-client/dist/auth";
import { getAppSettings } from "@shared/app-settings";
import { Themes, languageMapper, locales, systemName, appType } from "@shared/constants";
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
import Styles from "./splash-screen.module.scss";
import FadeContent from "./fade-content";
import Image from "next/image";
import { BASE_PATH } from "@shared/constants/base-path";
import { useRandomWaitingMessage } from "@shared/react-hooks/use-random-waiting-message";
import { getOperator } from "@shared/helpers/router-helper";

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
            <SplashScreenGame
                operator={operator}
                locale={locale}
                t={t}
                preloadProgress={preloadProgress}
                isDoneLoadConfig={isDoneLoadConfig}
            />
            {/* <LoggerControls className="fixed top-4 right-4 z-50" /> */}

            {isDoneLoadConfig && currentGameId >= 0 && (
                <>
                    <PreloadResources
                        setIsDonePreload={() => setIsRenderDashboard(true)}
                        gameId={currentGameId}
                        onProgressUpdate={handlePreloadProgress}
                    />
                </>
            )}
        </>
    );
};

export default memo(SplashScreen);

export const OriginalLogo = ({
    locale,
    t,
    preloadProgress,
    isDoneLoadConfig,
}: {
    locale: string;
    t: any;
    preloadProgress: any;
    isDoneLoadConfig: any;
}) => {
    return (
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
    );
};

export const Logo = () => {
    return (
        <svg width="205" height="52" viewBox="0 0 205 52" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g filter="url(#filter0_d_28_2650)">
                <g filter="url(#filter1_i_28_2650)">
                    <path
                        d="M162.918 27.4769C162.456 27.0819 161.934 26.7465 161.369 26.4976C160.586 26.173 159.798 25.9025 158.972 25.6753C158.858 25.6428 158.782 25.54 158.771 25.4156C158.771 25.302 158.826 25.1883 158.929 25.1234C159.744 24.7177 160.532 24.2578 161.293 23.7276C161.766 23.3651 162.211 22.9647 162.603 22.5103C163.021 22.0504 163.369 21.531 163.657 20.99C163.95 20.4165 164.157 19.8106 164.276 19.1776C164.412 18.4905 164.477 17.8034 164.477 17.1054C164.51 15.7908 164.249 14.4707 163.722 13.2642C163.168 12.1388 162.342 11.1596 161.325 10.4292C160.152 9.56356 158.793 8.93056 157.358 8.59513C155.777 8.20018 154.147 8 152.505 8C150.864 8 149.125 8.1569 147.462 8.48151C145.892 8.79531 144.376 9.39584 143.006 10.2398C141.696 11.0027 140.62 12.1064 139.887 13.4373C139.175 14.779 138.811 16.2723 138.832 17.7925C138.832 18.3985 138.887 18.999 139.001 19.5942C139.115 20.1893 139.294 20.7628 139.566 21.3146C139.827 21.8665 140.164 22.3858 140.571 22.8457C140.946 23.2839 141.376 23.6789 141.838 24.0251C142.495 24.4742 143.185 24.88 143.919 25.2208C144.022 25.2749 144.088 25.3885 144.077 25.5021C144.077 25.6158 143.995 25.7186 143.886 25.7618C143.071 26.0323 142.283 26.3461 141.501 26.7086C140.892 27.0224 140.327 27.4065 139.816 27.8556C139.218 28.375 138.707 28.9809 138.311 29.6572C137.871 30.3768 137.545 31.1559 137.327 31.9674C137.11 32.7897 137.001 33.6337 137.001 34.4886C136.979 35.8628 137.284 37.2153 137.881 38.438C138.539 39.6662 139.512 40.7103 140.707 41.4461C142.077 42.3334 143.593 42.9556 145.174 43.291C146.903 43.6643 148.68 43.8537 150.446 43.8537C152.332 43.8537 154.212 43.6373 156.043 43.2207C157.75 42.8582 159.358 42.1711 160.804 41.2189C162.162 40.2938 163.271 39.0332 164.015 37.5724C164.782 36.0954 165.189 34.4669 165.189 32.8006C165.189 32.1135 165.108 31.4264 164.95 30.7609C164.624 29.4895 163.912 28.3425 162.901 27.4823L162.912 27.4715L162.918 27.4769ZM155.266 35.0999C154.837 35.8087 154.212 36.3713 153.478 36.7338C152.712 37.0963 151.875 37.2857 151.022 37.2748C150.196 37.2748 149.381 37.1179 148.625 36.7771C147.902 36.4633 147.305 35.9331 146.897 35.2568C146.5 34.6022 146.299 33.861 146.299 33.0927C146.267 31.8754 146.75 30.696 147.647 29.852C148.663 28.9755 149.978 28.5373 151.31 28.613C152.522 28.5481 153.728 28.916 154.69 29.6626C155.538 30.4038 156 31.4859 155.945 32.6112C155.956 33.4877 155.728 34.3425 155.277 35.0999H155.266ZM154.701 21.2551C153.821 22.0342 152.679 22.4508 151.5 22.4129C150.799 22.4129 150.098 22.2776 149.462 21.9963C148.826 21.715 148.299 21.2551 147.946 20.6546C147.582 20.0703 147.403 19.394 147.413 18.6961C147.392 17.5707 147.832 16.4887 148.636 15.7042C149.517 14.871 150.707 14.4328 151.913 14.4869C153 14.4328 154.049 14.7899 154.875 15.4878C155.63 16.1749 156.038 17.165 156.005 18.1767C156.038 19.3345 155.565 20.4598 154.695 21.2389V21.2497L154.701 21.2551Z"
                        fill="#F67806"
                    />
                    <path
                        d="M196.75 30.7554C196.593 30.1116 196.332 29.5165 195.984 28.9538C195.631 28.402 195.201 27.8934 194.707 27.4768C194.245 27.0711 193.723 26.7464 193.158 26.4867C192.375 26.1621 191.587 25.8916 190.772 25.6644C190.658 25.6319 190.582 25.5291 190.571 25.4047C190.571 25.2911 190.615 25.1666 190.729 25.1125C191.555 24.7068 192.332 24.2469 193.093 23.7275C193.566 23.365 194.011 22.9484 194.413 22.5102C194.821 22.0503 195.169 21.531 195.468 20.9899C195.761 20.4165 195.968 19.8105 196.087 19.1775C196.223 18.4904 196.288 17.8033 196.288 17.1054C196.321 15.7907 196.06 14.4706 195.533 13.2641C194.979 12.1388 194.152 11.1703 193.136 10.4291C191.962 9.5635 190.604 8.9305 189.169 8.59507C187.588 8.20012 185.957 7.99994 184.316 7.99994C182.675 7.99994 180.936 8.15684 179.284 8.48145C177.713 8.80607 176.197 9.39578 174.817 10.2398C173.518 11.0189 172.442 12.1171 171.708 13.4372C170.997 14.779 170.632 16.283 170.654 17.7925C170.654 18.3984 170.708 18.999 170.823 19.5941C171.051 20.8006 171.589 21.9259 172.393 22.8457C172.768 23.2839 173.197 23.6788 173.659 24.0251C174.317 24.4741 175.007 24.8799 175.73 25.2207C175.833 25.2749 175.898 25.3885 175.887 25.5021C175.887 25.6157 175.806 25.7185 175.697 25.7618C174.882 26.0323 174.094 26.3461 173.322 26.7086C172.714 27.0224 172.149 27.4065 171.638 27.8555C171.04 28.3749 170.529 28.9809 170.122 29.6571C169.692 30.3767 169.366 31.1558 169.138 31.9673C168.921 32.7897 168.812 33.6337 168.812 34.4885C168.79 35.8627 169.094 37.2153 169.692 38.438C170.35 39.6769 171.333 40.7103 172.507 41.4569C173.877 42.3442 175.393 42.9772 176.985 43.3126C178.713 43.6859 180.48 43.8753 182.257 43.8753C184.131 43.8753 186.023 43.6589 187.854 43.2423C189.56 42.869 191.169 42.1927 192.615 41.2405C193.984 40.3153 195.082 39.0547 195.826 37.594C196.593 36.117 197 34.4777 197 32.8221C197 32.135 196.919 31.4479 196.761 30.7825L196.75 30.75V30.7554ZM187.05 35.0999C186.62 35.8086 185.995 36.3713 185.262 36.7338C184.506 37.1071 183.659 37.2856 182.805 37.2748C181.979 37.2748 181.153 37.1179 180.409 36.777C179.686 36.4632 179.088 35.933 178.67 35.2568C178.273 34.6021 178.072 33.8609 178.072 33.0927C178.039 31.8753 178.523 30.6959 179.42 29.8519C180.425 28.9863 181.751 28.5372 183.083 28.6022C184.294 28.5372 185.501 28.9051 186.463 29.6517C187.311 30.3929 187.773 31.4858 187.707 32.6003C187.718 33.466 187.49 34.3316 187.05 35.089V35.0999ZM186.474 21.255C185.593 22.0449 184.452 22.4507 183.273 22.4128C182.572 22.4128 181.871 22.2776 181.235 21.9854C180.599 21.7041 180.083 21.2442 179.73 20.6545C179.365 20.0594 179.186 19.3831 179.186 18.696C179.164 17.5815 179.605 16.4886 180.409 15.7041C181.289 14.871 182.479 14.4327 183.686 14.4868C184.773 14.4327 185.822 14.7898 186.648 15.4877C187.403 16.1748 187.811 17.1649 187.767 18.1766C187.8 19.3344 187.327 20.4597 186.457 21.2388L186.468 21.2496L186.474 21.255Z"
                        fill="#F67806"
                    />
                </g>
                <g filter="url(#filter2_i_28_2650)">
                    <path
                        d="M71.1406 19.0915C69.7929 17.8525 68.1897 16.9057 66.4616 16.3322C64.5976 15.6884 62.6303 15.3638 60.6468 15.3638C58.5219 15.3638 56.4188 15.7263 54.4135 16.4458C52.5495 17.1005 50.8377 18.1338 49.4139 19.508C48.1151 20.7686 47.1097 22.2889 46.463 23.9769C45.8435 25.6541 45.5228 27.4341 45.5337 29.2248C45.5337 31.0156 45.8489 32.7956 46.4847 34.4728C47.0934 36.0959 48.0661 37.5458 49.3324 38.7306C50.691 39.9696 52.305 40.9056 54.0603 41.4412C55.9841 42.0579 57.9948 42.388 60.0109 42.3771C62.1847 42.388 64.3422 42.0255 66.3909 41.3167C68.2658 40.6837 69.9668 39.5963 71.3091 38.1409C72.5318 36.8371 73.4665 35.2789 74.0589 33.5909C74.6023 31.9354 74.8849 30.1933 74.874 28.4458C74.874 26.6766 74.5806 24.9237 73.9719 23.2682C73.3741 21.683 72.4122 20.2492 71.1678 19.0806L71.146 19.0915H71.1406ZM64.853 32.0706C64.4889 33.1527 63.7987 34.0832 62.8857 34.7487C62.0271 35.3547 60.9837 35.6739 59.9349 35.663C58.5545 35.6847 57.234 35.1004 56.3264 34.067C55.2993 32.7848 54.7885 31.1725 54.8917 29.5278C54.8917 28.2781 55.0928 27.0283 55.5493 25.8489C55.9243 24.7993 56.6145 23.8903 57.5166 23.2357C58.3861 22.6406 59.4295 22.3214 60.4892 22.3376C61.4837 22.3268 62.4564 22.6081 63.2825 23.16C64.0759 23.701 64.6737 24.4638 64.9997 25.3565C65.353 26.3141 65.5323 27.3258 65.5214 28.3484C65.5214 29.609 65.3041 30.8696 64.8639 32.0652L64.853 32.076V32.0706Z"
                        fill="white"
                    />
                    <path
                        d="M100.941 16.0829C99.4136 16.0829 97.7996 16.0613 96.0986 16.0288L92.2402 27.1631C91.5609 29.1108 91.1751 30.1712 91.0881 30.4038L90.4414 32.4651C90.4088 32.5896 90.2947 32.5084 90.1697 32.5084C90.0447 32.5084 89.9415 32.5625 89.9088 32.4435C88.9252 28.402 88.0068 25.0044 87.1971 22.0504C86.4308 19.2912 85.8874 17.2786 85.5939 16.0613C84.1701 16.0937 82.6648 16.1046 81.0617 16.1046C79.5563 16.1046 77.9423 16.0937 76.2087 16.0613L81.9855 33.4877L84.5397 41.7166C86.4743 41.6842 88.2133 41.6734 89.773 41.6734C91.2077 41.6734 92.8597 41.6842 94.7237 41.7166L96.0117 38.4543L102.364 23.2785L105.587 16.0613C103.984 16.0937 102.43 16.0937 100.941 16.0937L100.93 16.0829H100.941Z"
                        fill="white"
                    />
                    <path
                        d="M130.569 18.1653C129.586 17.1158 128.308 16.3962 126.917 16.0499C125.2 15.5901 123.434 15.3628 121.646 15.3737C117.608 15.4656 113.581 15.9904 109.658 16.9372L109.283 19.7505C109.217 20.324 109.044 21.3358 108.783 22.7586C111.994 21.3844 115.418 20.5945 118.912 20.4268C119.771 20.3727 120.63 20.5729 121.391 21.0003C121.977 21.3844 122.342 22.0499 122.309 22.7586C122.309 23.3213 122.092 23.8623 121.7 24.2573C121.461 24.4953 121.179 24.6847 120.885 24.8308C120.363 25.0472 119.847 25.2257 119.304 25.361C118.581 25.5612 117.788 25.7451 116.929 25.9236C115.212 26.2483 113.516 26.6757 111.864 27.2167C110.766 27.5684 109.728 28.0499 108.756 28.6666C108.011 29.1752 107.343 29.792 106.788 30.5007C106.267 31.1553 105.848 31.8965 105.555 32.6864C105.294 33.4168 105.169 34.1851 105.158 34.9479C105.18 36.2897 105.555 37.6044 106.223 38.7621C106.892 39.9903 107.94 40.9587 109.228 41.5106C110.821 42.1273 112.522 42.4249 114.228 42.3762C115.505 42.3762 116.771 42.2626 118.037 42.0516C118.592 39.947 119.092 38.2374 119.51 36.9876C118.777 37.2365 118.005 37.3609 117.228 37.3609C116.402 37.4258 115.576 37.1824 114.924 36.6738C114.44 36.2464 114.157 35.6134 114.157 34.9642C114.157 34.5584 114.25 34.1634 114.429 33.7955C114.646 33.4006 114.94 33.0652 115.299 32.8055C115.717 32.4809 116.179 32.232 116.679 32.0426C117.19 31.8533 117.891 31.6152 118.782 31.3447C119.662 31.0742 120.276 30.874 120.624 30.7388C120.972 30.6035 121.45 30.3871 122.07 30.0841C122.102 30.0625 122.151 30.0517 122.195 30.0517C122.249 30.0517 122.309 30.0733 122.352 30.1058C122.445 30.1599 122.488 30.2627 122.477 30.3654C122.217 35.9055 121.977 39.7306 121.765 41.727C123.396 41.6945 124.934 41.6837 126.39 41.6837C127.847 41.6837 129.412 41.7053 130.95 41.727C131.075 36.4357 131.265 32.0913 131.504 28.7911C131.754 25.4475 131.868 23.2726 131.868 22.3312C131.971 20.8434 131.504 19.361 130.591 18.187L130.58 18.1762L130.569 18.1653Z"
                        fill="white"
                    />
                    <path
                        d="M34.264 8.91484C34.2531 10.8734 34.1607 14.1628 33.9814 18.6966C33.802 23.6253 33.6064 27.5477 33.4271 30.3232C33.4053 30.6045 33.1662 30.8317 32.8836 30.8426C32.6825 30.8426 32.4869 30.7181 32.4 30.5396L31.0088 27.7479L21.004 8.91484C18.7107 8.93648 16.9337 8.95812 15.6457 8.95812C13.8795 8.95812 12.6405 8.9473 9.69505 8.91484V12.2151L9.39072 19.2971L8.41796 36.8696L7.99951 41.4196C10.07 41.398 11.5047 41.3763 12.2981 41.3763C13.2383 41.3763 14.5588 41.3871 16.2652 41.4196L16.4935 32.1194L17.0043 20.4333C17.026 20.1411 17.2652 19.9139 17.5586 19.8922C17.776 19.8922 17.9662 20.0167 18.0423 20.1952C18.8085 21.7696 19.5693 23.2358 20.303 24.5721C21.4333 26.7091 22.6561 28.9273 23.9332 31.1564L27.9383 38.1951C28.3133 38.8714 28.8785 39.9426 29.623 41.4034C32.1011 41.3817 34.0574 41.3601 35.4921 41.3601C37.1333 41.3601 38.8832 41.3709 40.7526 41.4034L40.8885 36.058L41.9645 15.6344L42.4862 8.90402C40.269 8.93648 38.9104 8.9473 38.4158 8.9473C37.3507 8.9473 35.9758 8.9473 34.2748 8.91484H34.264Z"
                        fill="white"
                    />
                </g>
            </g>
            <defs>
                <filter
                    id="filter0_d_28_2650"
                    x="-0.000488281"
                    y="-6.10352e-05"
                    width="205"
                    height="51.8753"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="4" />
                    <feComposite in2="hardAlpha" operator="out" />
                    <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.1 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_28_2650" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_28_2650" result="shape" />
                </filter>
                <filter
                    id="filter1_i_28_2650"
                    x="137"
                    y="7.99994"
                    width="60"
                    height="35.8753"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_28_2650" />
                </filter>
                <filter
                    id="filter2_i_28_2650"
                    x="7.99951"
                    y="8.90402"
                    width="123.883"
                    height="33.4773"
                    filterUnits="userSpaceOnUse"
                    colorInterpolationFilters="sRGB"
                >
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset />
                    <feGaussianBlur stdDeviation="2" />
                    <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
                    <feBlend mode="normal" in2="shape" result="effect1_innerShadow_28_2650" />
                </filter>
            </defs>
        </svg>
    );
};

export const LogoVG = ({ locale = "en", t, preloadProgress }: { locale: string; t: any; preloadProgress: any }) => {
    return (
        <div className="flex flex-col w-full h-full items-center justify-center relative">
            <Image
                src={`${BASE_PATH}/static/images/splash-screen/logo-vgaming.webp`}
                alt="logo-vg"
                width="0"
                height="0"
                className="w-[500px] h-auto"
                priority
            />
            <Image
                src={`${BASE_PATH}/static/images/splash-screen/splash-text/splash_text_${locale}.webp`}
                alt="text-splash"
                width="0"
                height="0"
                className="w-[300px] h-auto"
            />
            <Image
                className="mt-[80px] w-[100px] h-auto"
                src={`${BASE_PATH}/static/images/splash-screen/loading-bar-sabaplay.gif`}
                alt="text-splash"
                width="0"
                height="0"
            />
            <p className={"text-first-download text-sm md:text-base mt-[20px]"} data-testid="download-message">
                {preloadProgress > 0 && preloadProgress < 100 && <span> {Math.floor(preloadProgress)}%</span>}
            </p>
            <WaitingMessage locale={locale} />
        </div>
    );
};

export const LogoSaba = ({ locale, t, preloadProgress }: { locale: string; t: any; preloadProgress: any }) => {
    return (
        <div className="flex flex-col w-full h-full items-center justify-end relative">
            <div className="flex flex-col w-full h-full items-center justify-center relative">
                <Image
                    src={`${BASE_PATH}/static/images/splash-screen/logo-saba.webp`}
                    alt="logo-saba"
                    width="0"
                    height="0"
                    className="w-[270px] h-auto"
                    priority
                />
                <Image
                    src={`${BASE_PATH}/static/images/splash-screen/splash-text/splash_text_${locale}.webp`}
                    alt="text-splash"
                    width="0"
                    height="0"
                    className="w-[300px] h-auto"
                />
                <Image
                    className="mt-[30px] w-[100px] h-auto"
                    src={`${BASE_PATH}/static/images/splash-screen/loading-bar-sabaplay.gif`}
                    alt="text-splash"
                    width="0"
                    height="0"
                />

                <p className={"text-first-download text-sm md:text-base mt-[20px]"} data-testid="download-message">
                    {preloadProgress > 0 && preloadProgress < 100 && <span> {Math.floor(preloadProgress)}%</span>}
                </p>
            </div>
            <Image
                className="absolute w-[100px] bottom-[120px] h-auto"
                src={`${BASE_PATH}/static/images/splash-screen/powered_by.webp`}
                alt="power-by"
                width="0"
                height="0"
            />
            <WaitingMessage locale={locale} />
        </div>
    );
};

export const LogoSabaPlay = ({ locale, t, preloadProgress }: { locale: string; t: any; preloadProgress: any }) => {
    return (
        <div className="flex flex-col w-full h-full items-center justify-end relative">
            <div className="flex flex-col w-full h-full items-center justify-center relative">
                <Image
                    src={`${BASE_PATH}/static/images/splash-screen/logo-sabaplay.webp`}
                    alt="logo-sabaplay"
                    width="0"
                    height="0"
                    className="w-[200px] h-auto"
                    priority
                />
                <Image
                    src={`${BASE_PATH}/static/images/splash-screen/splash-text/slogan-sabaplay-${locale}.webp`}
                    alt="text-splash"
                    width="0"
                    height="0"
                    className="w-[300px] h-auto"
                />
                <Image
                    className="mt-[50px] w-[100px] h-auto"
                    src={`${BASE_PATH}/static/images/splash-screen/loading-bar-sabaplay.gif`}
                    alt="text-splash"
                    width="0"
                    height="0"
                />
                <p className={"text-first-download text-sm md:text-base mt-[20px]"} data-testid="download-message">
                    {preloadProgress > 0 && preloadProgress < 100 && <span> {Math.floor(preloadProgress)}%</span>}
                </p>
            </div>
            <WaitingMessage locale={locale} />
        </div>
    );
};

export const LogoTip88 = ({ locale, t, preloadProgress }: { locale: string; t: any; preloadProgress: any }) => {
    return (
        <div className="flex flex-col w-full h-full items-center justify-end relative">
            <div className="flex flex-col w-full h-full items-center justify-center relative">
                <Image
                    src={`${BASE_PATH}/static/images/splash-screen/logo-tip88.webp`}
                    alt="logo-tip88"
                    width="0"
                    height="0"
                    className="w-[300px] h-auto"
                    priority
                />
                <Image
                    src={`${BASE_PATH}/static/images/splash-screen/splash-text/splash_text_${locale}.webp`}
                    alt="text-splash"
                    width="0"
                    height="0"
                    className="w-[300px] h-auto"
                />
                <Image
                    className="mt-[50px] w-[100px] h-auto"
                    src={`${BASE_PATH}/static/images/splash-screen/loading-bar-sabaplay.gif`}
                    alt="text-splash"
                    width="0"
                    height="0"
                />
                <p className={"text-first-download text-sm md:text-base mt-[20px]"} data-testid="download-message">
                    {preloadProgress > 0 && preloadProgress < 100 && <span> {Math.floor(preloadProgress)}%</span>}
                </p>
            </div>
            <WaitingMessage locale={locale} />
        </div>
    );
};

export const WaitingMessage = ({ locale }: { locale: string }) => {
    const { message, isVisible, isFadingOut, className } = useRandomWaitingMessage({
        locale: locale,
        interval: 5000,
        showDuration: 4000,
    });

    const messageClassName = [Styles["waiting-message"], isVisible && Styles.show, isFadingOut && Styles["fade-out"], className]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={messageClassName} id="waiting-message">
            {message}
        </div>
    );
};

const SplashScreenGame = ({
    operator,
    locale,
    t,
    preloadProgress,
    isDoneLoadConfig,
}: {
    operator: string;
    locale: string;
    t: any;
    preloadProgress: any;
    isDoneLoadConfig: boolean;
}) => {
    switch (operator) {
        case "SP":
            return <LogoSabaPlay locale={locale} t={t} preloadProgress={preloadProgress} />;
        case "VG":
            return <LogoVG locale={locale} t={t} preloadProgress={preloadProgress} />;
        case "SG":
            return <LogoSaba locale={locale} t={t} preloadProgress={preloadProgress} />;
        case "TIP88":
            return <LogoTip88 locale={locale} t={t} preloadProgress={preloadProgress} />;
        default:
            return <OriginalLogo locale={locale} t={t} preloadProgress={preloadProgress} isDoneLoadConfig={isDoneLoadConfig} />;
    }
};
