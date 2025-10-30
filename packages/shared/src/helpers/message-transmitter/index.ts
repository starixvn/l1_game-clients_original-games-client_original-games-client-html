import { v4 as uuidv4 } from "uuid";

import { Listener } from "./type";

export default function messageTransmitter() {
    let listeners: Array<Listener> = [];

    const register = (messageKey: string, handleMessage: Function): string => {
        const listenerId = uuidv4();
        listeners.push({ messageKey, listenerId, handleMessage });

        return listenerId;
    };

    const unsubscribe = (listenerId: string) => {
        const listenerIndex = listeners.findIndex((listener) => listener.listenerId === listenerId);

        listenerIndex >= 0 && listeners.splice(listenerIndex, 1);
    };

    const clearAllListener = () => {
        listeners = [];
    };

    const broadcast = (message: any) => {
        for (const listener of listeners) {
            if (message[listener.messageKey] != null) {
                listener.handleMessage(message);
            }
        }
    };

    return {
        register,
        unsubscribe,
        clearAllListener,
        broadcast,
    };
}
