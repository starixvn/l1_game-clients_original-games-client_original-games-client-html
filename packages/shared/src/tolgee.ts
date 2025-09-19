import { FormatIcu } from "@tolgee/format-icu";
import { BackendFetch, GetPath, Tolgee } from "@tolgee/react";
import { getAppSettings } from "./app-settings";
import { buildVersion, locales } from "./constants";

const tolgeeNamespaceByGameSetting = Object.values(getAppSettings().gameSettings)
    .map((setting) => setting.tolgeeNamespace)
    .filter((ns) => ns);
const namespaces = ["SabaNumber", "Common", ...tolgeeNamespaceByGameSetting].filter((value, index, arr) => arr.indexOf(value) === index);
const trimSlashes = (path: string): string => {
    if (path.endsWith("/")) {
        return path.slice(0, -1);
    }
    return path;
};
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
const getPath: GetPath = ({ namespace, language, prefix }: { namespace: string; language: string; prefix: string }): string => {
    const fullPath = trimSlashes(prefix);
    return namespace ? `${fullPath}/${namespace}/${language}.json?v=${buildVersion}` : `${fullPath}/${language}.json?v=${buildVersion}`;
};
export const tolgee = Tolgee().use(FormatIcu()).use(BackendFetch({
    getPath,
    prefix: `${basePath}/i18n`
})).init({
    fallbackLanguage: "en",
    defaultLanguage: "en",
    availableLanguages: Object.values(locales),
    projectId: "5",
    ns: namespaces,
    defaultNs: "SabaNumber",
});