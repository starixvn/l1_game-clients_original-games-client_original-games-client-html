import { useShallow } from "zustand/react/shallow";
import usePlinkoGameStore from "../stores/plinko-game-store";
import { useGameStore } from "@shared/stores/game-store";
import { useBalance, useClientSeedPF } from "@shared/react-hooks";
import { useCallback } from "react";
import { broadcastNotice, createNoticeFromErrorCode } from "@shared/helpers";
import { NoticeErrorCode } from "@shared/constants/error-code-dictionary";

export const usePlaceBet = () => {
    const { sendSocketEvent, socket } = useGameStore(
        useShallow((state) => ({
            sendSocketEvent: state.sendSocketEvent,
            socket: state.socket,
        }))
    );
    const { gameMode, numberOfRows } = usePlinkoGameStore(
        useShallow((state) => ({
            gameMode: state.gameMode,
            numberOfRows: state.numberOfRows,
        }))
    );
    const { clientSeed } = useClientSeedPF();
    const balance = useBalance();

    const handlePlaceBet = useCallback(
        (amount: number) => {
            if (amount > balance) {
                const notice = createNoticeFromErrorCode(NoticeErrorCode.insufficientFund, {
                    gameName: "Plinko",
                    onClose: () => {},
                    duration: 3,
                    isWarning: false
                });

                broadcastNotice(notice);
                return false;
            }

            if (socket?.connected) {
                sendSocketEvent("bet", { amount, gameMode, numberOfRows, clientSeed });
                return true;
            }
            return false;
        },
        [balance, sendSocketEvent, socket, gameMode, numberOfRows, clientSeed]
    );

    return {
        handlePlaceBet,
    };
};