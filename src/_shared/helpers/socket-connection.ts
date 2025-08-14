import { io } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { getAppSettings } from "../app-settings";
import { buildServerUrl } from "../helpers";
import { SocketInfo } from "./../../components/game-base/type";
import { GameMessageHandler, messageEventType } from "../../components/game-base/handlers";
import { GameStore } from "../stores/game-store/game-store";

export function InitSocketIO(
    socketInfo: SocketInfo,
    session: any,
    gameName: string,
    gameMessageHandler: GameMessageHandler,
    gameStore: GameStore
) {
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

        socket.off(gameName).on(gameName, (message) => {
            gameMessageHandler.broadcastGameEvent(message);
            gameStore.registerEvent(message);
        });
        socket.off("message").on("message", (message) => {
            gameMessageHandler.broadcastGameMessage(message);
        });

        socket.on(messageEventType.SOCKET_CONNECTED, () => {
            socket.emit("signin", session);
            gameMessageHandler.broadcastGameEvent({ [messageEventType.SOCKET_CONNECTED]: true });
        });

        socket.on(messageEventType.SIGNED_IN, () => {
            socket.emit("inGame", gameName);
            gameMessageHandler.broadcastGameEvent({ [messageEventType.SIGNED_IN]: true });
        });

        socket.on(messageEventType.SOCKET_CONNECT_ERROR, () => {
            gameMessageHandler.broadcastGameEvent({ [messageEventType.SOCKET_CONNECT_ERROR]: true });
        });
        socket.on(messageEventType.SOCKET_DISCONNECTED, () => {
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
