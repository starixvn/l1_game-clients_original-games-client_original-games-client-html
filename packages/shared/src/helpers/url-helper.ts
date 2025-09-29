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
        const appSettings = getAppSettings();
        const mappedDomain = appSettings?.serverDomainMapper?.[hostName];
        if (mappedDomain) {
            return mappedDomain;
        }
        return extractDomainFromHostName(hostName);
    }

    return "";
};

export const extractDomainFromHostName = (hostName: string) => {
    const domainParts = hostName.split(".").reverse();
    if (domainParts.length >= 2) {
        return `${domainParts[1]}.${domainParts[0]}`;
    }
    // For localhost or single-part hostnames, return the hostname as is
    // This will be used when no domain mapping exists
    return hostName;
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
