import { FormatIcu } from "@tolgee/format-icu";
import { BackendFetch, GetPath, Tolgee } from "@tolgee/react";
import { getAppSettings } from "./app-settings";
import { buildVersion, locales } from "./constants";
import { logger } from './services/logger';

// Initialize Tolgee configuration with logging
logger.info('🌐 [TOLGEE] Initializing Tolgee configuration', {
    buildVersion,
    basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
    timestamp: new Date().toISOString()
});

const tolgeeNamespaceByGameSetting = Object.values(getAppSettings().gameSettings)
    .map((setting) => setting.tolgeeNamespace)
    .filter((ns) => ns);

const namespaces = ["SabaNumber", "Common", ...tolgeeNamespaceByGameSetting].filter((value, index, arr) => arr.indexOf(value) === index);

logger.info('📚 [TOLGEE] Namespace configuration', {
    gameNamespaces: tolgeeNamespaceByGameSetting,
    allNamespaces: namespaces,
    namespaceCount: namespaces.length
});

const trimSlashes = (path: string): string => {
    if (path.endsWith("/")) {
        return path.slice(0, -1);
    }
    return path;
};

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const getPath: GetPath = ({ namespace, language, prefix }: { namespace: string; language: string; prefix: string }): string => {
    const fullPath = trimSlashes(prefix);
    const filePath = namespace ? `${fullPath}/${namespace}/${language}.json?v=${buildVersion}` : `${fullPath}/${language}.json?v=${buildVersion}`;
    
    logger.debug('📁 [TOLGEE] Generating file path', {
        namespace,
        language,
        prefix,
        fullPath,
        filePath,
        buildVersion
    });
    
    return filePath;
};
logger.info('🔧 [TOLGEE] Creating Tolgee instance', {
    prefix: `${basePath}/i18n`,
    fallbackLanguage: "en",
    defaultLanguage: "en",
    availableLanguages: Object.values(locales),
    projectId: "5",
    namespaces,
    defaultNamespace: "SabaNumber"
});

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

logger.info('✅ [TOLGEE] Tolgee instance created successfully', {
    availableLanguages: Object.values(locales),
    namespaceCount: namespaces.length,
    i18nPrefix: `${basePath}/i18n`
});