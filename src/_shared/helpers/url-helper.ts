import { getAppSettings, getAppSettingsForGame } from "../app-settings";
import { loadURLContext } from "../react-contexts";

function resolveGameIdOrOp(): { gameId?: number; op?: string } {
    try {
        if (typeof window !== "undefined" && window.location?.search) {
            const params = new URLSearchParams(window.location.search.replace(/&amp;/g, "&"));
            const gameId = Number(params.get("gameId") || 0) || undefined;
            const op = (params.get("op") || "").toUpperCase() || undefined;
            if (gameId || op) {
                return { gameId, op };
            }
        }
    } catch { }

    const { gameId } = loadURLContext() || {};
    return { gameId };
}

export const buildUrl = (subDomain?: string, path = "/") => {
    const domain = getRootDomain();

    // Resolve proxy config: prefer per-game when URL indicates VG or gameId=148
    const { gameId, op } = resolveGameIdOrOp();
    const shouldUseVG = gameId === 148 || op === "VG";

    const defaultProxy = getAppSettings().proxy;
    const vgProxy = shouldUseVG && gameId ? getAppSettingsForGame(gameId)?.proxy : undefined;

    // Force VG proxy when applicable, ignore caller-provided subDomain
    const selectedProxy = vgProxy || defaultProxy;
    const finalSubDomain = vgProxy ? vgProxy.subDomain : (subDomain ?? selectedProxy?.subDomain);

    const protocol = selectedProxy?.ssl ? "https" : "http";
    const subDomainText = `${finalSubDomain}.`;

    return `${protocol}://${finalSubDomain === "" ? "" : subDomainText}${domain}${path}`;
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
