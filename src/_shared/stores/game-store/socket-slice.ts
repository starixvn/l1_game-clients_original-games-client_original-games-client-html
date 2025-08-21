import { Socket } from "socket.io-client";
import { StateCreator } from "zustand";

export interface SocketSlice {
    socket: Socket;
    setSocket: (socket: Socket) => void;
    sendSocketEvent: (event: string, data: any) => void;
}

export const createSocketSlice: StateCreator<SocketSlice> = (set, get, store) => ({
    socket: null,
    setSocket: (socket) => set({ socket }),
    sendSocketEvent: (event, data) => {
        get().socket?.emit(event, data);
    },
});
