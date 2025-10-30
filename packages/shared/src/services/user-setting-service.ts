import { SSOResponse } from "sc-user-service-client/dist/auth";
import { UserClientCommunication } from "./user-client-communication";

const userClientInstance = UserClientCommunication?.getUserClientInstance();
const userSettingsService = userClientInstance?.userSettings;
const chipSettings = userClientInstance?.setting;

export const updateSignInSMStatus = async (userSession: SSOResponse) => {
    return userSettingsService?.updateSignInSMStatus(userSession.ss, userSession.username);
};

export const getChipSettings = async (userSession: SSOResponse) => {
    return chipSettings?.getSettings(userSession.ss, userSession.username);
};
