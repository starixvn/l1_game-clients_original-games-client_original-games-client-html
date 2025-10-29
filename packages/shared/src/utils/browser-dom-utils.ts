import { StorageHelper } from "@shared/helpers";
import { GameUtils } from "@shared/helpers/base-64-helper";
import { localStorageKeys } from "@shared/helpers/storage-helper";

export class BrowserDomUtils {
    public static replaceParentLocation(url: string) {
        this.postMessageToParent({ replaceUrl: url });
    }

    public static postMessageToParent(data: unknown) {
        const lobbyUrl = StorageHelper.get<string>(localStorageKeys.lobbyUrl);
        if (lobbyUrl) {
            const url = GameUtils.base64Decode(lobbyUrl);
            window.parent?.postMessage(data, url);
        }
    }
}
