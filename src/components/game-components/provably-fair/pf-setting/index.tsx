import { FC, useEffect, useRef, useState } from "react";

import { useGameContext } from "../../../../_shared/react-contexts";
import { useGameStateContext } from "../../../../_shared/react-contexts/game-state-context/game-state-context";
import { useCommonTranslate, useSNTranslate } from "../../../../_shared/react-hooks";
import { messageEventType } from "../../../game-base/handlers";
import { PFSeverSeed } from "../../../game-base/type";
import { LoadingSpinner } from "../../game-loading/loading-spinner";
import ModalContainer from "../../modal-container";
import CopyableTextInput from "../copyable-text-input";
import { WrapperPFGuide } from "../pf-guide";
import Styles from "../provably-fair.module.scss";
import usePFStore from "../../../../_shared/stores/pf-store/pf-store";
import { useShallow } from "zustand/shallow";
import ToggleSection from "./toggle-section";
import useGameStore from "../../../../_shared/stores/game-store/game-store";

const NUMBER_VALUES = "0123456789";
const GetPFInfoMessage = "getRoundPF";
const PFResultMessage = "roundPFResult";
const PFPublishMessage = "pf";
const TIME_OUT = 5000;

const SECTION_TITLE_CLASS = Styles["section-title"];

const handleOnKeyDown = (event: any) => {
    const chr = event.key;
    if ((NUMBER_VALUES.indexOf(chr) < 0 && event.which !== 8) || (event.target.value.length >= 4 && event.which !== 8)) {
        event.preventDefault();
    }
};

const PFSettingModal: FC<{ customClientSeedInfo?: string }> = ({ customClientSeedInfo }) => {
    const { isShowPFSetting, togglePFSetting, expandGuideFirst, toggleExpandGuideFirst } = usePFStore(
        useShallow((state) => ({
            isShowPFSetting: state.isShowPFSetting,
            togglePFSetting: state.togglePFSetting,
            expandGuideFirst: state.expandGuideFirst,
            toggleExpandGuideFirst: state.toggleExpandGuideFirst,
        }))
    );

    const { t: translateSNGames } = useSNTranslate();
    const { t: translateCommon } = useCommonTranslate();
    const handleCloseModal = () => {
        togglePFSetting(false);
        toggleExpandGuideFirst(false);
    };

    const [isSettingsExpanded, setIsSettingsExpanded] = useState<boolean>(!expandGuideFirst);
    const [isGuidesExpanded, setIsGuidesExpanded] = useState<boolean>(expandGuideFirst);

    useEffect(() => {
        if (isShowPFSetting) {
            setIsSettingsExpanded(!expandGuideFirst);
            setIsGuidesExpanded(expandGuideFirst);
        }
    }, [isShowPFSetting]);

    const toggleSettingsSection = () => {
        setIsSettingsExpanded(!isSettingsExpanded);
        if (isGuidesExpanded) {
            setIsGuidesExpanded(false);
        }
    };

    const toggleGuidesSection = () => {
        setIsGuidesExpanded(!isGuidesExpanded);
        if (isSettingsExpanded) {
            setIsSettingsExpanded(false);
        }
    };

    return (
        isShowPFSetting && (
            <ModalContainer
                id="pf-setting"
                title={<div className="flex-1 text-center">{translateSNGames("pf_title_bacball_provably_fair_settings")}</div>}
                isOpen={true}
                onCloseModal={handleCloseModal}
                extendedClassName="md:top-[50px] md:bottom-auto md:max-w-3xl md:h-[730px] md:mx-auto"
            >
                <div className="ml-4 mr-4 mt-3 h-full flex flex-col gap-5">
                    <div className="flex flex-col">
                        <ToggleSection
                            title={translateCommon("pf_title_provably_fair_settings")}
                            isExpanded={isSettingsExpanded}
                            onToggle={toggleSettingsSection}
                            contentClassName="h-auto"
                        >
                            <PFSetting customClientSeedInfo={customClientSeedInfo} />
                        </ToggleSection>
                    </div>

                    <ToggleSection
                        title={translateCommon("pf_pop-up_title_pf_guide")}
                        isExpanded={isGuidesExpanded}
                        onToggle={toggleGuidesSection}
                        className="flex flex-col "
                        contentClassName="h-full"
                    >
                        <WrapperPFGuide />
                    </ToggleSection>
                </div>
            </ModalContainer>
        )
    );
};

const PFSetting: FC<{ customClientSeedInfo?: string }> = ({ customClientSeedInfo }) => {
    const randomRadio = useRef<HTMLInputElement>();
    const randomSeed = useRef<HTMLInputElement>();
    const manualRadio = useRef<HTMLInputElement>();
    const manualSeed = useRef<HTMLInputElement>();
    const { roundId } = useGameStateContext();

    const { pfClientSeedSetting, serverSeedHash, updateServerSeedHash } = usePFStore(
        useShallow((state) => ({
            pfClientSeedSetting: state.pfClientSeedSetting,
            serverSeedHash: state.serverSeedHash,
            updateServerSeedHash: state.updateServerSeedHash,
        }))
    );
    const ownBets = useGameStore((state) => state.ownBets);
    const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
    const [isFirstFetch, setIsFirstFetch] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isManualMode, setIsManualMode] = useState<boolean>(pfClientSeedSetting?.useManualClientSeed || false);
    const [manualClientSeed, setManualClientSeed] = useState<string>(pfClientSeedSetting?.manualClientSeed || "");
    const [randomClientSeed, setRandomClientSeed] = useState<string>(pfClientSeedSetting?.randomClientSeed || "");

    const { t: translateCommon } = useCommonTranslate();
    const { gameMessageHandler } = useGameContext();
    const { t: translateSNGames } = useSNTranslate();

    const updatePFSetting = (pfSetting: Object) => {
        gameMessageHandler.broadcastGameEvent({
            [messageEventType.SAVE_PF_SETTING]: {
                pfClientSeedSetting: pfSetting,
            },
        });
    };

    useEffect(() => {
        setRandomClientSeed(pfClientSeedSetting?.randomClientSeed || "");
        setManualClientSeed(pfClientSeedSetting?.manualClientSeed || "");
        setIsManualMode(pfClientSeedSetting?.useManualClientSeed || false);
    }, [pfClientSeedSetting]);

    useEffect(() => {
        setIsFirstFetch(true);
    }, [roundId]);

    useEffect(() => {
        if (isFirstFetch) {
            gameMessageHandler.broadcastGameEvent({
                [messageEventType.SEND_SOCKET_MESSAGE]: { event: GetPFInfoMessage, data: { roundId } },
            });
            setIsFirstFetch(false);
        }
    }, [isFirstFetch]);

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
        }, TIME_OUT);

        const handleServerSeed = (pfServerSeed: PFSeverSeed) => {
            updateServerSeedHash(pfServerSeed.serverSeedHash);
        };

        const publishPFSeverSeedHandler = gameMessageHandler.register(PFPublishMessage, ({ pf }) => {
            handleServerSeed(pf);
            setIsLoading(false);
        });

        const pfResultHandler = gameMessageHandler.register(PFResultMessage, ({ roundPFResult }) => {
            handleServerSeed(roundPFResult);
            setIsLoading(false);
        });

        return () => {
            gameMessageHandler.removeHandler(pfResultHandler);
            gameMessageHandler.removeHandler(publishPFSeverSeedHandler);
        };
    }, []);

    const handlePaste = (event: any) => {
        const value = event.target.value;
        const numberRegex = /^\d+$/;
        if (value.length > 4 || !numberRegex.test(value)) {
            event.preventDefault();
        }
    };

    const handleOnBlur = (event: any) => {
        if (event.target.value.length === 0) {
            event.target.value = randomSeed.current.value;
            setManualClientSeed(randomSeed.current.value);
        }
        updatePFSetting({
            manualClientSeed: event.target.value,
        });
    };

    useEffect(() => {
        if (isManualMode) {
            if (!isFirstLoad) {
                manualSeed?.current?.focus();
            }
            setIsFirstLoad(false);
        } else {
            setManualClientSeed("");
        }
    }, [isManualMode]);

    const handleCheckRadio = () => {
        setIsManualMode(!isManualMode);
        setIsFirstLoad(false);
        if (manualRadio.current.checked) {
            setManualClientSeed(randomClientSeed);
            updatePFSetting({
                useManualClientSeed: true,
                manualClientSeed: randomSeed.current.value,
            });
        } else {
            updatePFSetting({
                useManualClientSeed: false,
                manualClientSeed: undefined,
            });
        }
    };

    const handleOnChangeManualClientSeed = (event: any) => {
        setManualClientSeed(event.target.value);
        updatePFSetting({
            manualClientSeed: event.target.value,
        });
    };

    return (
        <div className={Styles["pf-setting-container"] + " bg-[var(--modal-background)]"}>
            <div>
                <ul>
                    <li>{customClientSeedInfo || translateSNGames("pf_settings_para_1")}</li>
                    <li>{translateCommon("pf_settings_para_2")}</li>
                </ul>
            </div>
            <h3 className={SECTION_TITLE_CLASS}>{translateCommon("pf_header_client_seed")}</h3>
            <div className={Styles["client-seed-form"]}>
                {Object.keys(ownBets).length > 0 && <div className={Styles["form-overlay"]}></div>}
                {isLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className={Styles["client-seed-options"]}>
                        <div className={Styles["client-seed-option"]}>
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    ref={randomRadio}
                                    type="radio"
                                    id="random-seed"
                                    name="client-seed"
                                    checked={!isManualMode}
                                    onChange={handleCheckRadio}
                                />
                                <label className="form-check-label" htmlFor="random-seed">
                                    {translateCommon("pf_client_seed_para_4")}
                                </label>
                            </div>

                            <input
                                className={"form-control" + (isManualMode ? "" : " checked")}
                                ref={randomSeed}
                                type="text"
                                id="random-client-seed"
                                value={randomClientSeed || ""}
                                readOnly={true}
                                disabled={isManualMode}
                            />
                        </div>
                        <div className={Styles["client-seed-option"]}>
                            <div className="form-check">
                                <input
                                    ref={manualRadio}
                                    type="radio"
                                    id="manual-seed"
                                    name="client-seed"
                                    checked={isManualMode}
                                    onChange={handleCheckRadio}
                                    className="form-check-input"
                                />
                                <label className={`form-check-label ${Styles["form-check-label"]}`} htmlFor="manual-seed">
                                    <div className={Styles["form-check-label-note"]}>
                                        {`${translateCommon("pf_client_seed_para_3")}`} <br /> <span>(0 - 9999)</span>
                                    </div>
                                </label>
                            </div>
                            <input
                                className={"form-control" + (isManualMode ? " checked" : "")}
                                id="manual-client-seed"
                                ref={manualSeed}
                                type="text"
                                inputMode="numeric"
                                onKeyDown={handleOnKeyDown}
                                onPaste={handlePaste}
                                onBlur={handleOnBlur}
                                onFocus={(e) => e.target.select()}
                                onChange={handleOnChangeManualClientSeed}
                                disabled={!isManualMode}
                                value={isManualMode ? manualClientSeed || "" : ""}
                            />
                        </div>
                    </div>
                )}
            </div>

            <h3 className={SECTION_TITLE_CLASS}>{translateCommon("pf_header_server_seed_sha256")}</h3>
            <div className={Styles["client-seed-form"]}>
                <div className="input-group width-full">
                    <CopyableTextInput value={serverSeedHash} id="server-seed-hash" />
                </div>
                {Object.keys(ownBets).length > 0 && <div className={Styles["pf-note"]}>{translateCommon("pf_client_seed_para_1")}</div>}
            </div>
        </div>
    );
};

export default PFSettingModal;
