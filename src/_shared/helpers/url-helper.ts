import { getAppSettings, getAppSettingsForGame } from "../app-settings";
import { loadURLContext } from "../react-contexts";

export const buildUrl = (subDomain?: string, path = "/") => {
    const domain = getRootDomain();

    // Resolve proxy config: prefer per-game when URL has gameId, fallback to global
    const { gameId } = loadURLContext() || {};
    const gameAppSettings = gameId ? getAppSettingsForGame(gameId) : null;
    const proxy = gameAppSettings?.proxy || getAppSettings().proxy;

    const finalSubDomain = subDomain ?? proxy?.subDomain;
    const subDomainText = `${finalSubDomain}.`;

    return `${proxy?.ssl ? "https" : "http"}://${finalSubDomain === "" ? "" : subDomainText}${domain}${path}`;
};

export const getRootDomain = () => {
    if (typeof window !== "undefined" && window.location && window.location.hostname) {
        const hostName = window.location.hostname;
        return (
            (!!getAppSettings().serverDomainMapper && getAppSettings().serverDomainMapper[hostName]) || extractDomainFromHostName(hostName)
        );
    }

    return "";
};

export const extractDomainFromHostName = (hostName: string) => {
    const domainParts = hostName.split(".").reverse();
    return `${domainParts[1]}.${domainParts[0]}`;
};

export const buildGameGuideUrl = () => {
    return buildUrl(getAppSettings().subGuideDomain, "");
};

export const buildServerUrl = (path: string) => {
    const pathStr = `/user/${path}`;
    return buildUrlWithPath(pathStr);
};

export const buildUrlWithPath = (path: string) => {
    return buildUrl(undefined, path);
};
