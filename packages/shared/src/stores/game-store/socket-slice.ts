import { Socket } from "socket.io-client";
import { StateCreator } from "zustand";

export interface SocketSlice {
    socket: Socket;
    setSocket: (socket: Socket) => void;
    sendSocketEvent: (event: string, data: any) => void;
}

export const createSocketSlice: StateCreator<SocketSlice> = (set, get) => ({
    socket: null,
    setSocket: (socket) => {
        console.log("[SocketSlice] Setting socket", { socketId: socket?.id, previousSocketId: get().socket?.id });
        set({ socket });
    },
    sendSocketEvent: (event, data) => {
        console.log("[SocketSlice] Sending socket event", { event, data, socketId: get().socket?.id });
        get().socket?.emit(event, data);
    },
});
