import { buildUrl, isKickOutError, localStorageKeys, StorageHelper, broadcastNotice, getNotice } from '@shared/helpers';
import { getAppSettings } from '@shared/app-settings';
import { io, Socket } from "socket.io-client";
import MsgpackParser from "socket.io-msgpack-parser";
import { reCheckIn } from "../../../../services/auth-service";
import { ReCheckInResponse, SSOResponse } from "sc-user-service-client/dist/auth";

export class NotificationHandler {
    private reCheckInInterval: NodeJS.Timeout;
    public isKickOut = false;
    public notificationSocket: Socket = null;

    constructor(
        private readonly session: SSOResponse,
        private readonly setIsUm: Function,
        private readonly updateUserBalance: Function,
        private readonly signOut: Function
    ) {}

    init() {
        this.reset();
        this.connectNotificationSocket();
        this.reCheckInInterval = setInterval(async () => {
            this.handleReCheckIn();
        }, 60 * 1000);
        this.handleReCheckIn();
    }

    connectNotificationSocket = () => {
        const { proxy, enableMsgpackParser } = getAppSettings();

        const socketUri = buildUrl();
        const socketOption = {
            forceNew: false,
            transports: ["websocket"],
            upgrade: false,
            auth: {
                ss: this.session.ss,
                username: this.session.username,
            },
            path: `${proxy.path}/notification/socket.io`,
            parser: enableMsgpackParser ? MsgpackParser : undefined,
        };

        this.notificationSocket = io(socketUri, socketOption);
        this.registerNotificationSocketEvent();
    };

    handleRecheckInResponse = (response: ReCheckInResponse) => {
        if (!response || !response.isSuccessful) {
            this.signOut();
        } else if (response.apiError) {
            this.handleShowApiErrorMessage(response.apiError.errorCode, response.isDisableAccount);
        } else {
            this.updateUserBalance(response.balance, false);
            this.updateSSOTime();
        }
    };

    updateSSOTime = () => {
        const session = StorageHelper.get<SSOResponse & { ssoTime: Date }>(localStorageKeys.session);
        if (session?.ssoTime) {
            session.ssoTime = new Date();
            StorageHelper.set(localStorageKeys.session, session);
        }
    };

    handleShowApiErrorMessage = (errorCode: string, isDisableAccount = false) => {
        if (isDisableAccount || isKickOutError(errorCode)) {
            this.isKickOut = true;
            setTimeout(() => {
                this.signOut();
            }, 10000);
        }

        broadcastNotice({
            ...getNotice(errorCode, false),
            onClose: () => {
                if (this.isKickOut) {
                    this.signOut();
                }
            },
        });
    };

    registerNotificationSocketEvent = () => {
        this.notificationSocket.on("auth", this.handleAuth);
        this.notificationSocket.on("kickedOut", this.handleKickedOut);
        this.notificationSocket.on("reload", this.handleReload);
    };

    handleAuth = (data: { authorized: boolean }) => {
        if (!data.authorized) {
            this.handleKickedOut(data);
        }
    };

    handleKickedOut = (data: any) => {
        const { umInfo } = data;

        if (umInfo) {
            this.reCheckInInterval && clearInterval(this.reCheckInInterval);
            StorageHelper.set(localStorageKeys.umInfo, umInfo);
            setTimeout(() => {
                this.setIsUm(true);
            }, 500);
        } else {
            this.signOut();
        }
    };

    handleReload() {
        globalThis.location.reload();
    }

    handleReCheckIn = async () => {
        const reCheckInResponse = await reCheckIn(this.session);
        this.handleRecheckInResponse(reCheckInResponse);
    };

    reset = () => {
        this.notificationSocket?.close();
        clearInterval(this.reCheckInInterval);
    };
}
