import { IUserServiceClient } from "sc-user-service-client/dist";
import { getAppSettings } from '@shared/merged/_shared/app-settings';
import { buildUrlWithPath } from '@shared/merged/_shared/helpers/url-helper';

let UserServiceClient;

if (typeof window !== "undefined") {
    const { default: UserServiceClientModule } = require("sc-user-service-client");
    UserServiceClient = UserServiceClientModule;
}

export class UserClientCommunication {
    private static instance: IUserServiceClient | null = null;

    public static getUserClientInstance(): IUserServiceClient | null {
        if (!this.instance) {
            this.instance = typeof window !== "undefined" ? new UserServiceClient(this.getUserServiceUrl()) : null;
        }
        return this.instance;
    }

    private static getUserServiceUrl(): string {
        const { proxy } = getAppSettings();
        const basePath = proxy.path || "";
        const path = `${basePath}/user`;
        return buildUrlWithPath(path);
    }
}
export default UserClientCommunication;
