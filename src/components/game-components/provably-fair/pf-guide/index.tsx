import { FC, memo, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from "uuid";

import { buildVersion, Themes } from "../../../../_shared/constants";
import { AnalyticsHelper, TrackingAction, TrackingFunction, buildGameGuideUrl } from "../../../../_shared/helpers";
import { useGameStateContext } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { useClickSound, useCommonTranslate } from "../../../../_shared/react-hooks";
import { tolgee } from "../../../../_shared/tolgee";
import { LoadingSpinner } from "../../game-loading/loading-spinner";
import ModalContainer from "../../modal-container";
import Styles from "./pf-guide.module.scss";

const PFGuide: FC = () => {
    const { gameConfigs } = useGameStateContext();
    const theme = "pf-original";
    const language = tolgee.getLanguage() ?? "en";
    const wrapperRef = useRef<HTMLIFrameElement>();
    const wrapperIframeRef = useRef<HTMLIFrameElement>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const guideUrl = buildGameGuideUrl();
    const srcPath = `${guideUrl}/${language}/?gId=${gameConfigs["gameId"]}&t=${theme}&dy=1&f=pf&v=${buildVersion}`;
    const hideSpinner = () => {
        setIsLoading(false);
        wrapperIframeRef.current?.contentWindow.postMessage(JSON.stringify(gameConfigs), "*");
    };

    return useMemo(() => {
        return (
            <div className={Styles["container-guide"]} ref={wrapperRef}>
                {isLoading && <LoadingSpinner />}
                <iframe
                    style={{ display: isLoading ? "none" : "block" }}
                    ref={wrapperIframeRef}
                    key={uuidv4()}
                    className={`${Styles["guide-iframe"]} min-h-screen`}
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

const WrapperPFGuide = memo(PFGuide);

const PFGuideModal: FC<{ handleCloseModal?: Function; isOpen: boolean; data?: any }> = ({ handleCloseModal, isOpen, data }) => {
    const { t: translateCommon } = useCommonTranslate();

    return (
        isOpen &&
        createPortal(
            <ModalContainer
                id="pf-verify-detail-modal"
                title={translateCommon("pf_pop-up_title_pf_guide")}
                isOpen={isOpen}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                <WrapperPFGuide />
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

const ButtonPFGuide: FC = () => {
    const [isShowPFGuide, setIsShowPFGuide] = useState(false);
    const onCloseModal = () => {
        setIsShowPFGuide(false);
    };
    const clickSound = useClickSound();

    return (
        <>
            <button
                className={Styles["btn-pf-guide"]}
                onClick={() => {
                    clickSound();
                    setIsShowPFGuide(true);
                    AnalyticsHelper.trackFunction({ function: TrackingFunction.PFGuide, action: TrackingAction.Open });
                }}
            >
                <span className="icon-guide" />
            </button>
            <PFGuideModal isOpen={isShowPFGuide} handleCloseModal={onCloseModal} />
        </>
    );
};

export { ButtonPFGuide, PFGuideModal, PFGuide, WrapperPFGuide };
