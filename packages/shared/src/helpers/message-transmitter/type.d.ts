export interface MessageTransmitterType {
    register(key: string, listener: Function): string;
    unsubscribe(listenerId: string);
    clearAllListener();
    broadcast(message: any);
}

export interface Listener {
    listenerId: string;
    messageKey: string;
    handleMessage: Function;
}
