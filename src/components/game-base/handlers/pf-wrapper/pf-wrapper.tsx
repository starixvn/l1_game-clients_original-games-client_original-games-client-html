import { useEffect } from "react";
import { localStorageKeys, randomNumberSeries, StorageHelper } from "../../../../_shared/helpers";
import { GameIds } from "../../../../_shared/constants";
import { GameMessageHandler, messageEventType } from "../game-message-handler";
import { Socket } from "socket.io-client";
import { usePFStore } from "../../../../_shared/stores/pf-store/pf-store";
import { useShallow } from "zustand/shallow";

export type PFWrapperProps = {
    socket: Socket;
    gameMessageHandler: GameMessageHandler;
    uid: any;
    gameId: number;
    children: any;
};

export const PFWrapper = (props: PFWrapperProps) => {
    const { pfClientSeedSetting, updatePFClientSeedSetting, setOwnBets } = usePFStore(useShallow(
        (state: any) => ({
            pfClientSeedSetting: state.pfClientSeedSetting,
            updatePFClientSeedSetting: state.updatePFClientSeedSetting,
            setOwnBets: state.setOwnBets,
        })
    ));

    useEffect(() => {
        const loadPFSettingId = props.gameMessageHandler.register(messageEventType.SYNC_OWN_BETS_TO_PF, (message) => {
            setOwnBets(message[messageEventType.SYNC_OWN_BETS_TO_PF]);
        });

        return () => {
            props.gameMessageHandler.removeHandler(loadPFSettingId);
            StorageHelper.set(localStorageKeys.isSleepMode, document.hidden);
        };
        // Intentional: register once on mount and cleanup on unmount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const sendSocketMessageWithClientSeed = (message) => {
            const { event, data } = message[messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED];
            let clientSeed = pfClientSeedSetting?.useManualClientSeed
                ? pfClientSeedSetting?.manualClientSeed
                : pfClientSeedSetting?.randomClientSeed;
            if (!clientSeed || String(clientSeed).length === 0) {
                clientSeed = pfClientSeedSetting?.randomClientSeed || "0000";
            }

            // Support minimal payload for games that expect only amount, betChoice, clientSeed
            if (data?.__pfMode === "clientSeedOnly") {
                const { __pfMode, ...rest } = data;
                props.socket.emit(event, { ...rest, clientSeed });
                return;
            }

            // Force attach clientSeed for Sedie Multiplayer bet event
            if (props.gameId === GameIds.SeDieMultiplayer && event === "bet") {
                props.socket.emit(event, { ...data, clientSeed });
                return;
            }

            const clientSeedDetail = {
                randomClientSeed: pfClientSeedSetting?.randomClientSeed,
                manualClientSeed: pfClientSeedSetting?.manualClientSeed,
                useManualClientSeed: pfClientSeedSetting?.useManualClientSeed,
            };

            props.socket.emit(event, { ...data, clientSeed, clientSeedDetail });
        };

        const handleSavePFSetting = (message) => {
            const { pfClientSeedSetting } = message[messageEventType.SAVE_PF_SETTING];
            updatePFClientSeedSetting(pfClientSeedSetting);
        };

        const handleSavePFSettingFromTurnIdHandler = (message) => {
            const { drawId } = message[messageEventType.SAVE_PF_SETTING_FROM_TURN_ID_HANLDER];
            const oldDrawId = pfClientSeedSetting?.drawId;
            if (oldDrawId !== drawId) {
                handleSavePFSetting({
                    [messageEventType.SAVE_PF_SETTING]: {
                        pfClientSeedSetting: {
                            drawId: drawId,
                            randomClientSeed: randomNumberSeries(4),
                        },
                    },
                });
            }
        };

        const savePFSettingId = props.gameMessageHandler.register(messageEventType.SAVE_PF_SETTING, handleSavePFSetting);
        const sendSocketId = props.gameMessageHandler.register(
            messageEventType.SEND_SOCKET_MESSAGE_WITH_CLIENT_SEED,
            sendSocketMessageWithClientSeed
        );
        const savePFSettingFromTurnId = props.gameMessageHandler.register(
            messageEventType.SAVE_PF_SETTING_FROM_TURN_ID_HANLDER,
            handleSavePFSettingFromTurnIdHandler
        );

        return () => {
            props.gameMessageHandler.removeHandler(savePFSettingId);
            props.gameMessageHandler.removeHandler(sendSocketId);
            props.gameMessageHandler.removeHandler(savePFSettingFromTurnId);
        };
        // Dependencies controlled at registration time; avoid re-register loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pfClientSeedSetting]);

    return <> {props.children} </>;
};
