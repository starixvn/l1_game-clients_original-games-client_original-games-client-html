import { FC, memo, useMemo, useRef, useState, useEffect } from "react";

import { buildVersion } from "@shared/constants";
import { buildGameGuideUrl } from "@shared/helpers";
import { usePlayerContext } from "@shared/react-contexts";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { useCommonTranslate, useAppTheme } from "@shared/react-hooks";
import { tolgee } from "@shared/tolgee";
import { LoadingSpinner } from "../game-loading/loading-spinner";
import ModalContainer from "../modal-container";
import usePopupStore from "@shared/stores/popup-store/popup-store";
import { themeGuide } from "./constants";

const GameGuideModal: FC = () => {
    const isShowGameGuide = usePopupStore((state) => state.isShowGameGuide);
    const toggleGameGuide = usePopupStore((state) => state.toggleGameGuide);
    const { t: translate } = useCommonTranslate();

    const handleCloseModal = () => {
        toggleGameGuide(false);
    };

    return (
        isShowGameGuide && (
            <ModalContainer id="game-guide" isOpen={true} onCloseModal={handleCloseModal} title={translate("game_guide")}>
                <WrapperGameGuide />
            </ModalContainer>
        )
    );
};

const GameGuide: FC = () => {
    const { userStakeLevel, gameConfigs } = useGameStateContext();
    const { currentTheme } = useAppTheme();
    const language = tolgee.getLanguage() ?? "en";
    const wrapperRef = useRef<HTMLIFrameElement>();
    const wrapperIframeRef = useRef<HTMLIFrameElement>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { fractionalOddsFormat } = usePlayerContext();
    const minMaxBetParams = `&minBet=${userStakeLevel?.minBet}&maxBet=${userStakeLevel?.maxBet}`;
    const guideUrl = buildGameGuideUrl();
    const srcPath = `${guideUrl}/${language}/?gId=${gameConfigs["gameId"]}&t=${themeGuide}${minMaxBetParams}&dy=1&v=${buildVersion}&fof=${fractionalOddsFormat}&currentTheme=${currentTheme}`;

    const hideSpinner = () => {
        setIsLoading(false);
        if (wrapperIframeRef.current && wrapperIframeRef.current.contentWindow) {
            wrapperIframeRef.current.contentWindow.postMessage(JSON.stringify(gameConfigs), "*");
        }
    };

    const preventWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
        }
    };

    const preventAllZoom = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    useEffect(() => {
        if (wrapperRef.current) {
            const wrapperElement = wrapperRef.current;

            if (wrapperElement) {
                wrapperElement.addEventListener("wheel", preventWheel, { passive: false });

                // Block gesture events
                wrapperElement.addEventListener("gesturestart", preventAllZoom, { passive: false });
                wrapperElement.addEventListener("gesturechange", preventAllZoom, { passive: false });
                wrapperElement.addEventListener("gestureend", preventAllZoom, { passive: false });
            }

            return () => {
                if (wrapperElement) {
                    wrapperElement.removeEventListener("wheel", preventWheel, { capture: true });
                    wrapperElement.removeEventListener("gesturestart", preventAllZoom, { capture: true });
                    wrapperElement.removeEventListener("gesturechange", preventAllZoom, { capture: true });
                    wrapperElement.removeEventListener("gestureend", preventAllZoom, { capture: true });
                }
            };
        }
    }, [isLoading]);

    return useMemo(() => {
        return (
            <div
                className="h-full border-none"
                ref={wrapperRef as React.RefObject<HTMLDivElement>}
                style={{
                    touchAction: "none",
                }}
            >
                {isLoading && <LoadingSpinner />}
                <iframe
                    style={{
                        display: isLoading ? "none" : "block",
                        touchAction: "none",
                    }}
                    ref={wrapperIframeRef as React.RefObject<HTMLIFrameElement>}
                    className="h-full w-full border-none bg-transparent"
                    allowTransparency={true}
                    src={srcPath}
                    referrerPolicy="strict-origin-when-cross-origin"
                    onLoad={() =>
                        setTimeout(() => {
                            hideSpinner();
                        }, 300)
                    }
                />
            </div>
        );
    }, [isLoading]);
};

const WrapperGameGuide = memo(GameGuide);

export default GameGuideModal;
