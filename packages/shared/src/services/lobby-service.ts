import { SSOResponse } from "sc-user-service-client/dist/auth";
import { UserClientCommunication } from "./user-client-communication";
import { logger } from "./logger";

const lobbyService = UserClientCommunication?.getUserClientInstance()?.lobby;

export const fetchLobbyConfigs = async (session: SSOResponse) => {
    logger.info('Fetching lobby configurations', { username: session.username });

    try {
        const result = await lobbyService?.getLobbyConfigs(session.ss, session.username);
        logger.info('Lobby configurations retrieved', {
            username: session.username,
            hasResult: !!result
        });
        return result;
    } catch (error) {
        logger.error('Failed to fetch lobby configurations', { error, username: session.username });
        throw error;
    }
};
