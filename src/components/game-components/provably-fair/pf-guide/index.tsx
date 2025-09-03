import { FC, memo, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { v4 as uuidv4 } from "uuid";
import { buildVersion } from "../../../../_shared/constants";
import { buildGameGuideUrl } from "../../../../_shared/helpers";
import { useGameStateContext } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { useAppTheme, useClickSound, useCommonTranslate } from "../../../../_shared/react-hooks";
import { tolgee } from "../../../../_shared/tolgee";
import { LoadingSpinner } from "../../game-loading/loading-spinner";
import Styles from "./pf-guide.module.scss";
import ModalContainer from "../../modal-container";
import Image from "next/image";

const PFGuide: FC = () => {
    const { gameConfigs } = useGameStateContext();
    const { currentTheme } = useAppTheme();
    const theme = "original";
    const language = tolgee.getLanguage() ?? "en";
    const wrapperRef = useRef<HTMLIFrameElement>();
    const wrapperIframeRef = useRef<HTMLIFrameElement>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const guideUrl = buildGameGuideUrl();
    const srcPath = `${guideUrl}/${language}/?gId=${gameConfigs["gameId"]}&t=${theme}&dy=1&f=pf&v=${buildVersion}&currentTheme=${currentTheme}`;
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
                    className="h-full w-full bg-transparent"
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
                extendedClassName="md:top-[50px] md:bottom-auto md:max-w-3xl md:h-[730px] md:mx-auto"
            >
                <WrapperPFGuide />
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

const ButtonPFGuide: FC<{ className?: string }> = ({ className = "absolute top-5 left-4" }) => {
    const [isShowPFGuide, setIsShowPFGuide] = useState(false);
    const onCloseModal = () => {
        setIsShowPFGuide(false);
    };
    const clickSound = useClickSound();

    return (
        <>
            <button
                className={className}
                onClick={() => {
                    clickSound();
                    setIsShowPFGuide(true);
                }}
            >
                <Image src="/static/images/icons/question-mark.svg" alt="close" width={32} height={32} />
            </button>
            <PFGuideModal isOpen={isShowPFGuide} handleCloseModal={onCloseModal} />
        </>
    );
};

export { ButtonPFGuide, PFGuideModal, PFGuide, WrapperPFGuide };
