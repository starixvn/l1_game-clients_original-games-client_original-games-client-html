const { DevTools, Tolgee } = require("@tolgee/react");
const fs = require("fs");
const path = require("path");
const gameSettings = require("../../sedie-multiplayer/game-settings.json");

console.log("[TolgeeGenerator] Tolgee generator starting");

// Standalone locales definition
const locales = { 
    en: "en",
    vi: "vi",
    th: "th",
    id: "id",
    zh_cn: "zh_cn",
    zh_tw: "zh_tw",
    ms: "ms",
    hi_in: "hi_in",
    bn_bd: "bn_bd",
    ko: "ko",
    pt_br: "pt_br",
 };

function writeFile(fileName: string, content: string, extension = "json") {
    console.log("[TolgeeGenerator] writeFile called for:", fileName);
    const dirname = path.dirname(fileName);

    if (!fs.existsSync(dirname)) {
        console.log("[TolgeeGenerator] creating directory:", dirname);
        fs.mkdirSync(dirname, { recursive: true });
    }

    fs.writeFileSync(`${fileName}.${extension}`, content, {
        encoding: "utf8",
        flag: "w",
    });
    console.log("[TolgeeGenerator] file written successfully:", `${fileName}.${extension}`);
}

interface GameSettings {
    tolgeeNamespace?: string;
}

const tmpGameSettings: { [id: string]: GameSettings } = gameSettings;

const tolgeeNamespaceByGameSetting = Object.values(tmpGameSettings)
    .map((setting) => setting.tolgeeNamespace)
    .filter((ns) => ns);
const namespaces = ["SabaNumber", "Common", ...tolgeeNamespaceByGameSetting].filter((value, index, arr) => arr.indexOf(value) === index);

console.log("[TolgeeGenerator] namespaces:", namespaces);

const tg = Tolgee().use(DevTools()).init({
    defaultLanguage: "en",
    fallbackLanguage: "en",
    availableLanguages: Object.values(locales),
    apiKey: "tgpak_gvpw45brha2xg3btoztxeytunvudc5dbn5twqodtonztc",
    apiUrl: "https://tolgee.sabagame.com/",
    projectId: "5",
    defaultNs: "SabaNumber",
    ns: namespaces,
});

console.log("[TolgeeGenerator] Tolgee initialized, starting run");

tg.run();

tg.on("initialLoad", async () => {
    console.log("[TolgeeGenerator] initialLoad event triggered");
    const languages: {
        [languageId: string]: {
            [ns: string]: {
                [key: string]: string;
            };
        };
    } = {};
    Object.values(locales).forEach(async (languageId) => {
        console.log("[TolgeeGenerator] processing language:", languageId);
        await tg.changeLanguage(languageId);
        languages[languageId] = {};
        tg.getAllRecords().forEach((record) => {
            namespaces.forEach((namespace) => {
                if (record.namespace === namespace) {
                    languages[languageId][namespace] = {};
                    record.data.forEach((value, key) => {
                        languages[languageId][namespace][key] = value as string;
                    });

                    writeFile(`../sedie-multiplayer/public/i18n/${namespace}/` + languageId, JSON.stringify(languages[languageId][namespace], null, 4));
                }
            });
        });
    });
    console.log("[TolgeeGenerator] initialLoad completed");
});
