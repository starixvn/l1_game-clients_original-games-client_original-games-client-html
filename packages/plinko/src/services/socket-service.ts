import { io, Socket } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { getAppSettings } from "@shared/app-settings";
import { buildServerUrl } from "@shared/helpers";
import { SocketInfo } from "@shared/components/game-base/type";
import { GameMessageHandler, messageEventType } from "@shared/components/game-base/handlers";
import useGameStore from "@shared/stores/game-store/game-store";
import useBettingStore from "@shared/stores/betting-store/betting-store";
import { logger } from "@shared/services/logger";
import { logger as plinkoLogger } from "./logger";

export class PlinkoSocketService {
    private socket: Socket | null = null;
    private gameMessageHandler: GameMessageHandler;
    private session: any;
    private gameName: string;
    private socketInfo: SocketInfo;

    constructor(gameMessageHandler: GameMessageHandler, session: any, gameName: string, socketInfo: SocketInfo) {
        this.gameMessageHandler = gameMessageHandler;
        this.session = session;
        this.gameName = gameName;
        this.socketInfo = socketInfo;
    }

    public connect(): Socket {
        const { proxy, enableMsgpackParser } = getAppSettings();
        const socketUri = buildServerUrl(this.socketInfo.namespace);
        const socketOption = {
            forceNew: true,
            transports: ["websocket"],
            path: `${proxy.path}/${this.socketInfo.path}/socket.io`,
            upgrade: false,
            parser: enableMsgpackParser ? MsgpackParser : undefined,
        };

        plinkoLogger.info('Initializing Socket.IO connection for Plinko', {
            gameName: this.gameName,
            socketUri,
            namespace: this.socketInfo.namespace,
            path: this.socketInfo.path,
            enableMsgpackParser
        });

        this.socket = io(socketUri, socketOption);

        if (this.socket) {
            plinkoLogger.info('Socket.IO connection established for Plinko', {
                gameName: this.gameName
            });

            this.gameMessageHandler.registerSocketEvents();
            useGameStore.getState().setSocket(this.socket);

            // Game-specific message handling
            this.socket.off(this.gameName).on(this.gameName, (message) => {
                plinkoLogger.debug('Received Plinko game message', {
                    gameName: this.gameName,
                    messageType: Object.keys(message)[0]
                });
                this.gameMessageHandler.broadcastGameEvent(message);
                useGameStore.getState().registerEvent(message);
                useBettingStore.getState().registerEvent(message);
            });

            // Generic message handling
            this.socket.off("message").on("message", (message) => {
                plinkoLogger.debug('Received generic message for Plinko', {
                    gameName: this.gameName,
                    messageType: Object.keys(message)[0]
                });
                this.gameMessageHandler.broadcastGameMessage(message);
                useGameStore.getState().registerEvent(message);
            });

            // Connection event handlers
            this.socket.on(messageEventType.SOCKET_CONNECTED, () => {
                plinkoLogger.info('Plinko socket connected, sending signin', {
                    gameName: this.gameName,
                    username: this.session?.username
                });
                this.socket.emit("signin", this.session);
                this.gameMessageHandler.broadcastGameEvent({ [messageEventType.SOCKET_CONNECTED]: true });
            });

            this.socket.on(messageEventType.SIGNED_IN, () => {
                plinkoLogger.info('Successfully signed in to Plinko, joining game room', {
                    gameName: this.gameName
                });
                this.socket.emit("inGame", this.gameName);
                this.gameMessageHandler.broadcastGameEvent({ [messageEventType.SIGNED_IN]: true });
            });

            this.socket.on(messageEventType.SOCKET_CONNECT_ERROR, (error) => {
                plinkoLogger.error('Plinko socket connection error', {
                    gameName: this.gameName,
                    error
                });
                console.error("PLINKO_SOCKET_CONNECT_ERROR", error);
                this.gameMessageHandler.broadcastGameEvent({ [messageEventType.SOCKET_CONNECT_ERROR]: true });
            });

            this.socket.on(messageEventType.SOCKET_DISCONNECTED, () => {
                plinkoLogger.warn('Plinko socket disconnected', {
                    gameName: this.gameName
                });
                this.gameMessageHandler.broadcastGameEvent({ [messageEventType.SOCKET_DISCONNECTED]: true });
            });
        }

        return this.socket;
    }

    public disconnect(): void {
        if (this.socket) {
            plinkoLogger.info('Disconnecting Plinko socket', {
                gameName: this.gameName
            });
            this.socket.disconnect();
            this.socket = null;
        }
    }

    public emit(event: string, data: any): void {
        if (this.socket) {
            plinkoLogger.debug('Emitting Plinko socket event', {
                event,
                gameName: this.gameName,
                hasData: !!data
            });
            this.socket.emit(event, data);
        } else {
            plinkoLogger.warn('Cannot emit event - socket not connected', {
                event,
                gameName: this.gameName
            });
        }
    }

    public on(event: string, callback: (...args: any[]) => void): void {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }

    public off(event: string, callback?: (...args: any[]) => void): void {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    public getSocket(): Socket | null {
        return this.socket;
    }

    public isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export function InitPlinkoSocketIO(
    socketInfo: SocketInfo,
    session: any,
    gameName: string,
    gameMessageHandler: GameMessageHandler
): PlinkoSocketService {
    const socketService = new PlinkoSocketService(gameMessageHandler, session, gameName, socketInfo);
    return socketService;
}

export enum SocketState {
    None,
    Connected,
    Error,
    Disconnected,
}
