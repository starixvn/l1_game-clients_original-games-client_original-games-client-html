import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useClickSound, useCommonTranslate, useSNTranslate } from "../../../../_shared/react-hooks";
import ModalContainer from "../../modal-container";
import { ButtonPFGuide } from "../pf-guide";
import Styles from "../provably-fair.module.scss";
import CopyableTextInput from "../copyable-text-input";
import { AnalyticsHelper, TrackingAction, TrackingFunction } from "../../../../_shared/helpers";
import { Section } from "../pf-form-components";
import { usePFStore } from "../../../../_shared/stores/pf-store/pf-store";
import { useShallow } from "zustand/react/shallow";
import { useGameContext } from "../../../../_shared/react-contexts/game-context/game-context";
import { messageEventType } from "../../../game-base/handlers/game-message-handler";
import { usePopupStore } from "../../../../_shared/stores/popup-store/popup-store";
import { useBetDetailStore } from "../../../../_shared/stores/bet-detail-store/bet-detail-store";

const GetPFInfoMessage = "getRoundPF";
const PFResultMessage = "roundPFResult";

const PFVerifyModal: FC<{
    renderResultBlock: Function;
}> = ({ renderResultBlock }) => {
    const { t: translateCommon } = useCommonTranslate();
    const { isShowPFVerify, togglePFVerify } = usePopupStore(
        useShallow((state) => ({
            isShowPFVerify: state.isShowPFVerify,
            togglePFVerify: state.togglePFVerify,
        }))
    );

    const handleCloseModal = () => {
        togglePFVerify(false);
    };

    return (
        isShowPFVerify &&
        createPortal(
            <ModalContainer
                id="pf-verify"
                title={
                    <div>
                        <ButtonPFGuide />
                        {translateCommon("pf_title_provably_fair").capitalizeFirstLetter()}
                    </div>
                }
                isOpen={isShowPFVerify}
                isOverlap={true}
                onCloseModal={handleCloseModal}
            >
                <PFVerify renderResultBlock={renderResultBlock} />
            </ModalContainer>,
            document.getElementById("dashboard")
        )
    );
};

const useClickOutside = (callback: Function) => {
    const ref = useRef<HTMLDivElement>();
    useEffect(() => {
        const handleClick = (event: any) => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback(ref.current, event.target);
            }
        };

        document.addEventListener("click", handleClick, true);

        return () => {
            document.removeEventListener("click", handleClick, true);
        };
    }, [ref]);

    return ref;
};

const PFVerify: FC<{ renderResultBlock: Function }> = ({ renderResultBlock }) => {
    const { pfVerifyModalData: pfResult, updatePFVerify } = usePFStore(useShallow((state) => ({
        pfVerifyModalData: state.pfVerifyModalData,
        updatePFVerify: state.updatePFVerify
    })));

    const { betDetailData } = useBetDetailStore(
        useShallow((state) => ({
            betDetailData: state.betDetailData,
        }))
    );

    const { gameMessageHandler } = useGameContext();
    
    const { t: translateCommon } = useCommonTranslate();
    const { t: translateSNGames } = useSNTranslate();
    const clickSound = useClickSound();
    const { togglePFClientSeedInfo, togglePFVerification } = usePopupStore(
        useShallow((state) => ({
            togglePFClientSeedInfo: state.togglePFClientSeedInfo,
            togglePFVerification: state.togglePFVerification,
        }))
    );

    const [isFirstFetch, setIsFirstFetch] = useState<boolean>(true);

    const handleClickOutSide = (target: any, clickedElement: any, except: any) => {
        if (!target.classList.contains(Styles["hide"]) && !except.contains(clickedElement)) {
            target.classList.add(Styles["hide"]);
        }
    };

    const clickOutSideClientSeedTooltip = useClickOutside((target: any, clickedElement: any) => {
        const btn = document.getElementById("btn-tooltip-client-seed");
        handleClickOutSide(target, clickedElement, btn);
    });

    const clickOutSideClientSeedTooltipPF = useClickOutside((target: any, clickedElement: any) => {
        const btn = document.getElementById("btn-tooltip-pf");
        handleClickOutSide(target, clickedElement, btn);
    });

    const handleClickTooltip = (event: React.MouseEvent<HTMLButtonElement> & React.FocusEvent<HTMLButtonElement>) => {
        clickSound();
        const currentTarget = event.currentTarget as HTMLElement;
        const tooltip = currentTarget.nextElementSibling as HTMLDivElement;
        tooltip.classList.toggle(Styles["hide"]);
    };

    const handleOnClickClientSeedInfo = () => {
        clickSound();
        togglePFClientSeedInfo(true);
        AnalyticsHelper.trackFunction({ function: TrackingFunction.PFClientSeeds, action: TrackingAction.Open });
    };

    const handleOnClickVerification = () => {
        clickSound();
        togglePFVerification(true);
        AnalyticsHelper.trackFunction({function: TrackingFunction.PFVerify,action: TrackingAction.Click,});
    };

    useEffect(() => {
        if (isFirstFetch) {
            gameMessageHandler.broadcastGameEvent({
                [messageEventType.SEND_SOCKET_MESSAGE]: { event: GetPFInfoMessage, data: { roundId: betDetailData.drawInfo.drawId } },
            });
            setIsFirstFetch(false);
        }
    }, [isFirstFetch]);

    useEffect(() => {
        const handlePFResult = (pfResult: any) => {
            updatePFVerify(pfResult);
        };

        const pfResultHandler = gameMessageHandler.register(PFResultMessage, ({ roundPFResult }) => {
            handlePFResult(roundPFResult);
        });

        return () => {
            gameMessageHandler.removeHandler(pfResultHandler);
        };
    }, []);

    return (
        <div className={Styles["pf-setting-container"]}>
            <div className="result-block">{renderResultBlock(pfResult)}</div>
            <ClientSeedForm>
                <Section title={translateCommon("pf_header_server_seed_sha256")}>
                    <div className="input-group width-full">
                        <CopyableTextInput value={pfResult?.serverSeedHash} id="server-seed-sha256" />
                    </div>
                </Section>
                <Section title={translateCommon("pf_header_server_seed")}>
                    <div className="input-group width-full">
                        <CopyableTextInput value={pfResult?.serverSeed} id="server-seed" />
                    </div>
                </Section>
            </ClientSeedForm>
            <ClientSeedForm>
                <Section title={translateCommon("pf_header_client_seed")}>
                    <div className={Styles["tooltip-container"]}>
                        <button className={Styles["btn-pf-intro"]} onClick={handleClickTooltip} id="btn-tooltip-client-seed">
                            <span className="icon-info" />
                        </button>
                        <div className={`${Styles["hide"]} ${Styles["pf-tooltip"]} break`} ref={clickOutSideClientSeedTooltip}>
                            {translateSNGames("pf_client_seed_tooltip")}
                        </div>
                    </div>
                </Section>
                <div className="relative">
                    <Section title={translateCommon("pf_ header_merge_client_seed")}>
                        <span className={Styles["link-detail"]} onClick={handleOnClickClientSeedInfo}>
                            {translateSNGames("pf_provably_fair_details")}
                        </span>
                    </Section>
                </div>
                <div className="input-group width-full">
                    <CopyableTextInput value={pfResult?.mergeClientSeed} id="merge-client-seed" />
                </div>
            </ClientSeedForm>
            <ClientSeedForm>
                <Section title={translateCommon("pf_header_combined_sha512_hash")}>
                    <div className={Styles["tooltip-container"]}>
                        <button className={Styles["btn-pf-intro"]} onClick={handleClickTooltip} id="btn-tooltip-pf">
                            <span className="icon-info" />
                        </button>
                        <div className={`${Styles["hide"]} ${Styles["pf-tooltip"]}`} ref={clickOutSideClientSeedTooltipPF}>
                            {translateSNGames("pf_combined_sha512_hash_tooltip")}
                        </div>
                    </div>
                </Section>
                <div className="input-group width-full mt-4">
                    <CopyableTextInput value={pfResult?.finalHash} id="combined-sha512-hash" />
                </div>
            </ClientSeedForm>
            <button className={`btn-green ${Styles["btn-verify"]}`} onClick={handleOnClickVerification}>
                {translateCommon("pf_button_verify")}
            </button>
            <p className="text-center mt-2">{translateCommon("pf_provably_fair_para_2")}</p>
        </div>
    );
};

const ClientSeedForm: FC<{ children: ReactNode }> = ({ children }) => {
    return <div className={Styles["client-seed-form"]}>{children}</div>;
};

export default PFVerifyModal;
