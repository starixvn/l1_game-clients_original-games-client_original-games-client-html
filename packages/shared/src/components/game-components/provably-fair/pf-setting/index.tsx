import { FC, useEffect, useRef, useState } from "react";

import { useGameContext } from "@shared/react-contexts";
import { useGameStateContext } from "@shared/react-contexts/game-state-context/game-state-context";
import { useClientSeedPF, useCommonTranslate, useSNTranslate } from "@shared/react-hooks";
import { messageEventType } from "../../../game-base/handlers";
import { PFSeverSeed } from "../../../game-base/type";
import { LoadingSpinner } from "../../game-loading/loading-spinner";
import ModalContainer from "../../modal-container";
import CopyableTextInput from "../copyable-text-input";
import { ButtonPFGuide } from "../pf-guide";
import Styles from "../provably-fair.module.scss";
import usePFStore from "@shared/stores/pf-store/pf-store";
import { useShallow } from "zustand/shallow";
import useGameStore from "@shared/stores/game-store/game-store";
import { cn } from "@shared/utils";
import { randomNumberSeries } from "@shared/helpers/number-helper";

const NUMBER_VALUES = "0123456789";
const GetPFInfoMessage = "getRoundPF";
const PFResultMessage = "roundPFResult";
export const TIME_OUT = 5000;

const SECTION_TITLE_CLASS = Styles["section-title"];
const INTER_FONT_STYLE = { fontFamily: "var(--font-family)" };

const handleOnKeyDown = (event: any) => {
    const chr = event.key;
    const target = event.target;
    const isTextSelected = target.selectionStart !== target.selectionEnd;

    // Allow typing if text is selected (for replace behavior)
    if (isTextSelected) {
        if (NUMBER_VALUES.indexOf(chr) < 0 && event.which !== 8) {
            event.preventDefault();
        }
        return;
    }

    // Original logic for when no text is selected
    if ((NUMBER_VALUES.indexOf(chr) < 0 && event.which !== 8) || (target.value.length >= 4 && event.which !== 8)) {
        event.preventDefault();
    }
};

const PFSettingModal: FC<{ customClientSeedInfo?: string; isSinglePlayer?: boolean }> = ({
    customClientSeedInfo,
    isSinglePlayer = false,
}) => {
    const { pfClientSeedSetting, updatePFClientSeedSetting, isShowPFSetting, togglePFSetting, serverSeedHash } = usePFStore(
        useShallow((state: any) => ({
            pfClientSeedSetting: state.pfClientSeedSetting,
            updatePFClientSeedSetting: state.updatePFClientSeedSetting,
            isShowPFSetting: state.isShowPFSetting,
            togglePFSetting: state.togglePFSetting,
            serverSeedHash: state.serverSeedHash,
        }))
    );

    const { t: translateSNGames } = useSNTranslate();

    const { clientSeed } = useClientSeedPF();
    const { socket } = useGameStore();
    const { gameMessageHandler } = useGameContext();

    useEffect(() => {
        const savePFSettingId = gameMessageHandler.register(messageEventType.SAVE_PF_SETTING, handleSavePFSetting);
        const sendSocketId = gameMessageHandler.register(
            messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED,
            sendSocketMessageWithClientSeed
        );
        const savePFSettingFromTurnId = gameMessageHandler.register(
            messageEventType.SAVE_PF_SETTING_FROM_ROUND_ID_HANLDER,
            handleSavePFSettingFromTurnIdHandler
        );

        return () => {
            gameMessageHandler.removeHandler(savePFSettingId);
            gameMessageHandler.removeHandler(sendSocketId);
            gameMessageHandler.removeHandler(savePFSettingFromTurnId);
        };
    }, [pfClientSeedSetting, clientSeed]);

    const sendSocketMessageWithClientSeed = (message) => {
        const { event, data } = message[messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED];

        if (data?.__pfMode === "clientSeedOnly") {
            const { __pfMode, ...rest } = data;
            socket.emit(event, { ...rest, clientSeed });
        }
    };

    const handleSavePFSetting = (message) => {
        const { pfClientSeedSetting } = message[messageEventType.SAVE_PF_SETTING];
        updatePFClientSeedSetting(pfClientSeedSetting);
    };

    useEffect(() => {
        if (isSinglePlayer) {
            if (serverSeedHash) {
                handleSavePFSetting({
                    [messageEventType.SAVE_PF_SETTING]: {
                        pfClientSeedSetting: {
                            randomClientSeed: randomNumberSeries(4),
                        },
                    },
                });
            }
        }
    }, [serverSeedHash]);

    const handleSavePFSettingFromTurnIdHandler = (message) => {
        const { roundId } = message[messageEventType.SAVE_PF_SETTING_FROM_ROUND_ID_HANLDER];
        const newRoundId = roundId;
        const oldRoundId = pfClientSeedSetting?.roundId;
        if (oldRoundId !== newRoundId) {
            handleSavePFSetting({
                [messageEventType.SAVE_PF_SETTING]: {
                    pfClientSeedSetting: {
                        roundId: newRoundId,
                        randomClientSeed: randomNumberSeries(4),
                    },
                },
            });
        }
    };

    const handleCloseModal = () => {
        togglePFSetting(false);
    };

    return (
        isShowPFSetting && (
            <ModalContainer
                id="pf-setting"
                title={
                    <div>
                        <ButtonPFGuide />
                        <div className="flex-1 text-center">{translateSNGames("pf_title_bacball_provably_fair_settings")}</div>
                    </div>
                }
                isOpen={true}
                onCloseModal={handleCloseModal}
            >
                <div className="ml-4 mr-4 mt-3 h-full flex flex-col gap-3">
                    <PFSetting customClientSeedInfo={customClientSeedInfo} />
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
        if (!serverSeedHash) {
            gameMessageHandler.broadcastGameEvent({
                [messageEventType.SEND_SOCKET_MESSAGE]: { event: GetPFInfoMessage, data: { roundId } },
            });
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
            }, TIME_OUT);
        }
    }, []);

    useEffect(() => {
        const handleServerSeed = (pfServerSeed: PFSeverSeed) => {
            updateServerSeedHash(pfServerSeed.serverSeedHash);
            setIsLoading(false);
        };

        const pfResultHandler = gameMessageHandler.register(PFResultMessage, ({ roundPFResult }) => {
            handleServerSeed(roundPFResult);
        });

        return () => {
            gameMessageHandler.removeHandler(pfResultHandler);
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
        <div className={Styles["pf-setting-container"] + " bg-none"}>
            <div>
                <ul>
                    <li className="text-sm md:text-base">{customClientSeedInfo || translateCommon("turn_based_pf_settings_para_1")}</li>
                    <li className="text-sm md:text-base">{translateCommon("pf_settings_para_2")}</li>
                </ul>
            </div>
            <div className="flex gap-4 flex-col">
                <div>
                    <h3 className={cn(SECTION_TITLE_CLASS, "m-0 p-1 text-sm md:text-base")}>{translateCommon("pf_header_client_seed")}</h3>
                    <div className={Styles["client-seed-form"]}>
                        {Object.keys(ownBets).length > 0 && <div className={Styles["form-overlay"]}></div>}
                        {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                            <div className={Styles["client-seed-options"]}>
                                <div className={Styles["client-seed-option"]}>
                                    <div className="form-check flex align-items-center">
                                        <input
                                            className="form-check-input h-0"
                                            ref={randomRadio}
                                            type="radio"
                                            id="random-seed"
                                            name="client-seed"
                                            checked={!isManualMode}
                                            onChange={handleCheckRadio}
                                        />
                                        <label className="form-check-label h-8" htmlFor="random-seed">
                                            <span className="text-sm md:text-base font-normal text-[#DDE2EA]" style={INTER_FONT_STYLE}>
                                                {translateCommon("pf_client_seed_para_4")}
                                            </span>
                                        </label>
                                    </div>

                                    <input
                                        className={cn(
                                            "form-control",
                                            isManualMode ? "" : " checked",
                                            "text-sm md:text-base font-normal text-white"
                                        )}
                                        ref={randomSeed}
                                        type="text"
                                        id="random-client-seed"
                                        value={randomClientSeed || ""}
                                        readOnly={true}
                                        disabled={isManualMode}
                                        style={INTER_FONT_STYLE}
                                    />
                                </div>
                                <div className={Styles["client-seed-option"]}>
                                    <div className="form-check flex align-items-center">
                                        <input
                                            ref={manualRadio}
                                            type="radio"
                                            id="manual-seed"
                                            name="client-seed"
                                            checked={isManualMode}
                                            onChange={handleCheckRadio}
                                            className="form-check-input h-0"
                                        />
                                        <label className={`form-check-label ${Styles["form-check-label"]} h-8`} htmlFor="manual-seed">
                                            <div className={Styles["form-check-label-note"]}>
                                                <span className="text-sm md:text-base font-normal text-[#DDE2EA]" style={INTER_FONT_STYLE}>
                                                    {`${translateCommon("pf_client_seed_para_3")}`} <br /> <span>(0 - 9999)</span>
                                                </span>
                                            </div>
                                        </label>
                                    </div>
                                    <input
                                        className={cn(
                                            "form-control",
                                            isManualMode ? " checked" : "",
                                            "text-sm md:text-base font-normal text-white"
                                        )}
                                        id="manual-client-seed"
                                        ref={manualSeed}
                                        type="text"
                                        inputMode="numeric"
                                        data-testid="manual-client-seed"
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
                </div>

                <div>
                    <h3 className={cn(SECTION_TITLE_CLASS, "m-0 p-1 text-sm md:text-base")}>{translateCommon("pf_header_server_seed_sha256")}</h3>
                    <div className={Styles["client-seed-form"]}>
                        <div className="input-group width-full">
                            <CopyableTextInput value={serverSeedHash} id="server-seed-hash" />
                        </div>
                        {Object.keys(ownBets).length > 0 && (
                            <div className={`${Styles["pf-note"]} text-sm md:text-base text-white`}>
                                {translateCommon("pf_client_seed_para_1")}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PFSettingModal;
