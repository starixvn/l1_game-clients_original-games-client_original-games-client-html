import { StorageHelper } from "@shared/helpers";
import { GameUtils } from "@shared/helpers/base-64-helper";
import { localStorageKeys } from "@shared/helpers/storage-helper";

export class BrowserDomUtils {
    public static replaceParentLocation(url: string) {
        this.postMessageToParent({ replaceUrl: url });
    }

    public static postMessageToParent(data: unknown) {
        const parentUrl = StorageHelper.get<string>(localStorageKeys.parentUrl);
        console.log("parentUrl", parentUrl);
        if (parentUrl) {
            const url = GameUtils.base64Decode(parentUrl);
            console.log("url", url);
            window.parent?.postMessage(data, url);
        }
    }
}
