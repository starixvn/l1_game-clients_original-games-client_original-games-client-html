import { io } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { getAppSettings } from "../app-settings";
import { buildServerUrl } from "../helpers";
import { SocketInfo } from "@shared/components/game-base/type";
import { GameMessageHandler, messageEventType } from "@shared/components/game-base/handlers";
import useGameStore from "../stores/game-store/game-store";
import useBettingStore from "../stores/betting-store/betting-store";
import { logger } from "../services/logger";

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

    logger.info('Initializing Socket.IO connection', {
        gameName,
        socketUri,
        namespace: socketInfo.namespace,
        path: socketInfo.path,
        enableMsgpackParser
    });

    const socket = io(socketUri, socketOption);

    if (socket) {
        logger.info('Socket.IO connection established, registering event handlers', { gameName });
        gameMessageHandler.registerSocketEvents();
        useGameStore.getState().setSocket(socket);

        socket.off(gameName).on(gameName, (message) => {
            logger.debug('Received game message', { gameName, messageType: Object.keys(message)[0] });
            console.log('🎯 SOCKET: Received message through gameName event:', message);
            gameMessageHandler.broadcastGameEvent(message);
            useGameStore.getState().registerEvent(message);
            useBettingStore.getState().registerEvent(message);
        });
        socket.off("message").on("message", (message) => {
            logger.debug('Received generic message', { gameName, messageType: Object.keys(message)[0] });
            console.log('🎯 SOCKET: Received message through message event:', message);
            gameMessageHandler.broadcastGameMessage(message);
            useGameStore.getState().registerEvent(message);
        });

        socket.on(messageEventType.SOCKET_CONNECTED, () => {
            logger.info('Socket connected, sending signin', { gameName, username: session?.username });
            socket.emit("signin", session);
            gameMessageHandler.broadcastGameEvent({ [messageEventType.SOCKET_CONNECTED]: true });
        });

        socket.on(messageEventType.SIGNED_IN, () => {
            logger.info('Successfully signed in, joining game room', { gameName });
            socket.emit("inGame", gameName);
            gameMessageHandler.broadcastGameEvent({ [messageEventType.SIGNED_IN]: true });
        });

        socket.on(messageEventType.SOCKET_CONNECT_ERROR, (error) => {
            logger.error('Socket connection error', { gameName, error });
            console.error("SOCKET_CONNECT_ERROR", error);
            gameMessageHandler.broadcastGameEvent({ [messageEventType.SOCKET_CONNECT_ERROR]: true });
        });
        socket.on(messageEventType.SOCKET_DISCONNECTED, (reason, details) => {
            logger.warn('Socket disconnected', { gameName, reason, details });
            console.error("SOCKET_DISCONNECTED", reason, details);
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
