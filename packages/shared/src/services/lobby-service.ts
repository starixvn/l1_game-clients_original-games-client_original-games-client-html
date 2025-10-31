import { SSOResponse } from "sc-user-service-client/dist/auth";
import { UserClientCommunication } from "./user-client-communication";

const lobbyService = UserClientCommunication?.getUserClientInstance()?.lobby;

export const fetchLobbyConfigs = async (session: SSOResponse) => {
    try {
        const result = await lobbyService?.getLobbyConfigs(session.ss, session.username);
        return result;
    } catch (error) {
        throw error;
    }
};
