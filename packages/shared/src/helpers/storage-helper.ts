import { getAppSettings } from "../app-settings";

interface IActionStorage {
    remove: (name: string) => void;
    get: (name: string) => string | object;
    set: (name: string, value: string | object, expiresDay?: number) => void;
    isAvailable: () => boolean;
}

declare global {
    interface GlobalThisShim {
        localMemory: object;
    } // NOSONAR
}

export class LocalStorage implements IActionStorage {
    remove(name: string) {
        localStorage.removeItem(name);
    }

    get(name: string) {
        const storage = localStorage.getItem(name);
        if (!storage) {
            return null;
        }
        try {
            return JSON.parse(storage);
        } catch (error) {
            return null;
        }
    }

    set(name: string, value: string | object) {
        localStorage.setItem(name, JSON.stringify(value));
    }

    isAvailable() {
        const test = "test storage";
        try {
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
}

export class Memory implements IActionStorage {
    localMemory: any;
    constructor() {
        (globalThis as unknown as GlobalThisShim).localMemory = {};
        this.localMemory = (globalThis as unknown as GlobalThisShim).localMemory;
    }

    remove(name: string) {
        delete this.localMemory[name];
    }

    get(name: string) {
        return this.localMemory[name] ? this.localMemory[name] : null;
    }

    set(name: string, value: any) {
        this.localMemory[name] = value;
    }

    isAvailable() {
        return true;
    }
}

export class StorageHelper {
    static supportStorage: IActionStorage;
    static prefixKey: string;

    private static initialize() {
        if (!StorageHelper.supportStorage) {
            const allStorage = [new LocalStorage(), new Memory()];
            StorageHelper.supportStorage = allStorage.filter((storage) => storage.isAvailable())[0];
            // Cleanup deprecated latest-game-id key (global key only)
            try {
                StorageHelper.supportStorage.remove(buildLocalStorageKey("latest-game-id"));
            } catch (_) {
                // ignore
            }
        }
    }

    static getCurrentStorage() {
        StorageHelper.initialize();
        return StorageHelper.supportStorage;
    }

    static get<T>(name: string) {
        return StorageHelper.getCurrentStorage().get(StorageHelper.getName(name)) as T;
    }

    static set(name: string, value: any) {
        StorageHelper.getCurrentStorage().set(StorageHelper.getName(name), value);
    }

    static remove(name: string) {
        StorageHelper.getCurrentStorage().remove(StorageHelper.getName(name));
    }

    static setPrefixKey(prefixKey: string) {
        StorageHelper.prefixKey = prefixKey;
    }

    static getName(name: string) {
        return StorageHelper.prefixKey ? `${StorageHelper.prefixKey}_${name}` : name;
    }
}

// Define a constant for the duplicated literal
const LATEST_GAME_ID_KEY = "latest-game-id";

export const localStorageKeys = {
    session: buildLocalStorageKey("auth-data"),
    rebet: buildLocalStorageKey("rebet"),
    umInfo: buildLocalStorageKey("um_info"),
    loginStatus: buildLocalStorageKey("login-status"),
    buildVersion: buildLocalStorageKey("build-version"),
    pfSetting: buildLocalStorageKey("pf-setting"),
    debug: buildLocalStorageKey("debug"),
    url: buildLocalStorageKey("url"),
    hideToolbarGuide: buildLocalStorageKey("hideToolbarGuide"),
    currentSessionHideToolbarGuide: buildLocalStorageKey("currentSessionHideToolbarGuide"),
    hideSwitchGameGuide: buildLocalStorageKey("hideSwitchGameGuide"),
    currentSessionSwitchGameGuide: buildLocalStorageKey("currentSessionSwitchGameGuide"),
    showPFSetting: buildLocalStorageKey("show-pf-setting"),
    isSleepMode: buildLocalStorageKey("is-sleep-mode"),
    pfStore: buildLocalStorageKey("pf-store"),
    settingStore: buildLocalStorageKey("setting-store"),
    // latestGameId is deprecated due to one-game-per-session behavior
    latestGameId: buildLocalStorageKey(LATEST_GAME_ID_KEY),
    // User-specific latestGameId is deprecated and kept only for backward-compat mocks
    parentUrl: buildLocalStorageKey("purl"),
    returnUrl: buildLocalStorageKey("rurl"),
    lobbyUrl: buildLocalStorageKey("lurl"),
    standaloneMode: buildLocalStorageKey("standaloneMode"),
    userLatestGameId: LATEST_GAME_ID_KEY,
    appType: buildLocalStorageKey("appType"),
};

export function buildLocalStorageKey(key: string) {
    if (typeof globalThis !== "undefined" && globalThis.location && globalThis.location.hostname) {
        return `${globalThis.location.hostname}.${key}.${getAppSettings().appType}`;
    }

    return key;
}

export function buildUserSpecificLocalStorageKey(key: string, username?: string) {
    const baseKey = buildLocalStorageKey(key);
    if (username) {
        return `${baseKey}.${username}`;
    }
    return baseKey;
}

export function getUserLatestGameId(_username?: string): number {
    // Disabled: do not persist or read latest-game-id anymore
    return 0;
}

export function setUserLatestGameId(_gameId: number, _username?: string): void {
    // Disabled: no-op per one-game-per-session behavior
}
