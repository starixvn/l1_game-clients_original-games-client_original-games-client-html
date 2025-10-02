import { io } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { getAppSettings } from "../app-settings";
import { buildServerUrl } from "../helpers";
import { SocketInfo } from "@shared/components/game-base/type";
import { GameMessageHandler, messageEventType } from "@shared/components/game-base/handlers";
import useGameStore from "../stores/game-store/game-store";
import useBettingStore from "../stores/betting-store/betting-store";

export function InitSocketIO(socketInfo: SocketInfo, session: any, gameName: string, gameMessageHandler: GameMessageHandler) {
    const { proxy, enableMsgpackParser } = getAppSettings();
    const socketUri = buildServerUrl(socketInfo.namespace);
    const socketOption = {
        forceNew: true,
        transports: ["websocket"],
        path: `${proxy.path}/${socketInfo.path}/socket.io`,
        upgrade: false,
        parser: enableMsgpackParser ? MsgpackParser : undefined,
    };

    const socket = io(socketUri, socketOption);

    if (socket) {
        gameMessageHandler.registerSocketEvents();
        useGameStore.getState().setSocket(socket);

        socket.off(gameName).on(gameName, (message) => {
            gameMessageHandler.broadcastGameEvent(message);
            useGameStore.getState().registerEvent(message);
            useBettingStore.getState().registerEvent(message);
        });
        socket.off("message").on("message", (message) => {
            gameMessageHandler.broadcastGameMessage(message);
            useGameStore.getState().registerEvent(message);
        });

        // Handle game-event messages (used by Plinko and other games)
        socket.off("game-event").on("game-event", (message) => {
            gameMessageHandler.broadcastGameEvent(message);
            useGameStore.getState().registerEvent(message);
            useBettingStore.getState().registerEvent(message);
        });

        socket.on(messageEventType.SOCKET_CONNECTED, () => {
            socket.emit("signin", session);
            gameMessageHandler.broadcastGameEvent({ [messageEventType.SOCKET_CONNECTED]: true });
        });

        socket.on(messageEventType.SIGNED_IN, () => {
            socket.emit("inGame", gameName);
            gameMessageHandler.broadcastGameEvent({ [messageEventType.SIGNED_IN]: true });
        });

        socket.on(messageEventType.SOCKET_CONNECT_ERROR, (error) => {
            gameMessageHandler.broadcastGameEvent({ [messageEventType.SOCKET_CONNECT_ERROR]: true });
        });
        socket.on(messageEventType.SOCKET_DISCONNECTED, (reason, details) => {
            gameMessageHandler.broadcastGameEvent({ [messageEventType.SOCKET_DISCONNECTED]: true });
        });
    }

    return { socket };
}

export enum SocketState {
    None,
    Connected,
    Error,
    Disconnected,
}
