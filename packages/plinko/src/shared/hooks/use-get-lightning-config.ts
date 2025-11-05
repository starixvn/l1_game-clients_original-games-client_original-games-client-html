import { useGameStore } from "@shared/stores/game-store";
import { useShallow } from "zustand/shallow";

export const GET_LIGHTNING_CONFIG_EVENT = "getLightningConfig";

export const useGetLightningConfig = () => {
    const { sendSocketEvent, socket } = useGameStore(
        useShallow((state) => ({
            sendSocketEvent: state.sendSocketEvent,
            socket: state.socket,
        }))
    );

    const getLightningConfig = (lightningKey?: string) => {
        if (socket?.connected) {
            sendSocketEvent(GET_LIGHTNING_CONFIG_EVENT, lightningKey ? { lightningKey } : {});
        }
    };

    return { getLightningConfig };
};
