import { getAppSettings } from "../app-settings";

export const buildUrl = (subDomain = getAppSettings().proxy?.subDomain, path = "/") => {
    const { proxy } = getAppSettings();
    const domain = getRootDomain();
    const subDomainText = `${subDomain}.`;
    return `${proxy.ssl ? "https" : "http"}://${subDomain === "" ? "" : subDomainText}${domain}${path}`;
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
    return buildUrl(getAppSettings().proxy?.subDomain, path);
};
