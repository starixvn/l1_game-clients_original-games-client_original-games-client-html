import { StateCreator } from "zustand";

export interface GlobalEventsSlice {
    // State
    openingGameId: number;
    backToLobby: boolean;
    closeDialog: boolean;
    userInfoRed: any;
    avatarId: number;
    
    // Actions
    setOpeningGameId: (gameId: number) => void;
    setBackToLobby: (backToLobby: boolean) => void;
    setCloseDialog: (closeDialog: boolean) => void;
    setUserInfoRed: (userInfo: any) => void;
    setAvatarId: (avatarId: number) => void;
    
    // Legacy broadcast method for backward compatibility
    broadcast: (event: Record<string, any>) => void;
}

export const createGlobalEventsSlice: StateCreator<GlobalEventsSlice> = (set) => ({
    openingGameId: 0,
    backToLobby: false,
    closeDialog: false,
    userInfoRed: null,
    avatarId: 0,
    
    setOpeningGameId: (gameId: number) => set({ openingGameId: gameId }),
    setBackToLobby: (backToLobby: boolean) => set({ backToLobby }),
    setCloseDialog: (closeDialog: boolean) => set({ closeDialog }),
    setUserInfoRed: (userInfo: any) => set({ userInfoRed: userInfo }),
    setAvatarId: (avatarId: number) => set({ avatarId }),
    
    broadcast: (event: Record<string, any>) => {
        if (event.openingGameId !== undefined) {
            set({ openingGameId: event.openingGameId });
        }
        if (event.backToLobby !== undefined) {
            set({ backToLobby: event.backToLobby });
        }
        if (event.closeDialog !== undefined) {
            set({ closeDialog: event.closeDialog });
        }
        if (event.userInfoRed !== undefined) {
            set({ userInfoRed: event.userInfoRed });
        }
        if (event.avatarId !== undefined) {
            set({ avatarId: event.avatarId });
        }
    },
});
