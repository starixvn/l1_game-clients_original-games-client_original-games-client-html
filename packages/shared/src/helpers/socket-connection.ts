import { io } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { getAppSettings } from "../app-settings";
import { buildServerUrl } from "../helpers";
import { SocketInfo } from "@shared/components/game-base/type";
import { GameMessageHandler, messageEventType } from "@shared/components/game-base/handlers";
import useGameStore from "../stores/game-store/game-store";
import useBettingStore from "../stores/betting-store/betting-store";
import { logger } from "../services/logger";
import { fileLoadingLogger } from './file-loading-logger';

export function InitSocketIO(socketInfo: SocketInfo, session: any, gameName: string, gameMessageHandler: GameMessageHandler) {
    const startTime = Date.now();
    const { proxy, enableMsgpackParser } = getAppSettings();
    const socketUri = buildServerUrl(socketInfo.namespace);

    logger.info('🔌 [SOCKET] Initializing Socket.IO connection', {
        gameName,
        socketUri,
        namespace: socketInfo.namespace,
        path: socketInfo.path,
        enableMsgpackParser,
        timestamp: new Date().toISOString()
    });

    // Track WebSocket connection
    fileLoadingLogger.trackWebSocketConnection(socketUri, 'socket.io');

    const socketOption = {
        forceNew: true,
        transports: ["websocket"],
        path: `${proxy.path}/${socketInfo.path}/socket.io`,
        upgrade: false,
        parser: enableMsgpackParser ? MsgpackParser : undefined,
    };

    const socket = io(socketUri, socketOption);

    if (socket) {
        const connectionTime = Date.now() - startTime;

        logger.info('✅ [SOCKET] Socket.IO connection established, registering event handlers', {
            gameName,
            connectionTime: `${connectionTime}ms`,
            socketUri
        });

        // Track successful WebSocket connection
        fileLoadingLogger.trackWebSocketResult(socketUri, true, connectionTime);

        gameMessageHandler.registerSocketEvents();
        useGameStore.getState().setSocket(socket);

        socket.off(gameName).on(gameName, (message) => {
            logger.debug('Received game message', { gameName, messageType: Object.keys(message)[0] });
            gameMessageHandler.broadcastGameEvent(message);
            useGameStore.getState().registerEvent(message);
            useBettingStore.getState().registerEvent(message);
        });
        socket.off("message").on("message", (message) => {
            logger.debug('Received generic message', { gameName, messageType: Object.keys(message)[0] });
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
            const connectionTime = Date.now() - startTime;

            logger.error('❌ [SOCKET] Socket connection error', {
                gameName,
                error: error.message || error,
                connectionTime: `${connectionTime}ms`,
                socketUri
            });

            // Track failed WebSocket connection
            fileLoadingLogger.trackWebSocketResult(socketUri, false, connectionTime);

            console.error("SOCKET_CONNECT_ERROR", error);
            gameMessageHandler.broadcastGameEvent({ [messageEventType.SOCKET_CONNECT_ERROR]: true });
        });

        socket.on(messageEventType.SOCKET_DISCONNECTED, (reason, details) => {
            logger.warn('⚠️ [SOCKET] Socket disconnected', {
                gameName,
                reason,
                details,
                socketUri
            });
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
