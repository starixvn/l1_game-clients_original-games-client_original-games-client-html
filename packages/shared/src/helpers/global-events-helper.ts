import { useGlobalEventsStore } from "../stores/global-events-store/global-events-store";

// Legacy event types for backward compatibility
export enum GlobalTransmitterEvent {
    BACK_TO_LOBBY = "backToLobby",
    OPEN_GAME_ID = "openingGameId",
    NOTICE = "notice",
    USER_INFO_RED = "userInfoRed",
    CHANGE_AVATAR_ID = "avatarId",
    CLOSE_DIALOG = "closeDialog"
}

// Replacement for GlobalMessageTransmitter.broadcast
export const broadcastGlobalEvent = (event: Record<string, any>) => {
    useGlobalEventsStore.getState().broadcast(event);
};

// Specific helper functions for common events
export const broadcastBackToLobby = () => {
    useGlobalEventsStore.getState().setBackToLobby(true);
};

export const broadcastOpeningGameId = (gameId: number) => {
    useGlobalEventsStore.getState().setOpeningGameId(gameId);
};

export const broadcastCloseDialog = () => {
    useGlobalEventsStore.getState().setCloseDialog(true);
};

export const broadcastUserInfoRed = (userInfo: any) => {
    useGlobalEventsStore.getState().setUserInfoRed(userInfo);
};

export const broadcastAvatarId = (avatarId: number) => {
    useGlobalEventsStore.getState().setAvatarId(avatarId);
};

// Legacy compatibility function
export const GlobalMessageTransmitter = {
    broadcast: broadcastGlobalEvent,
};
