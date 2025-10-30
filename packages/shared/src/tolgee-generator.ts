const { DevTools, Tolgee } = require("@tolgee/react");
const fs = require("fs");
const path = require("path");

// Function to dynamically discover and load all game configurations
const loadAllGameConfigs = () => {
    const packagesDir = path.resolve(__dirname, "../../");
    const gameConfigs: Array<{ gameSettings: any; outputPath: string; gameId: number }> = [];

    try {
        // Read all directories in packages/
        const packageDirs = fs.readdirSync(packagesDir, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .map(dirent => dirent.name)
            .filter(name => name !== "shared"); // Skip shared package

        for (const packageName of packageDirs) {
            const gameSettingsPath = path.join(packagesDir, packageName, "game-settings.json");
            const publicDir = path.join(packagesDir, packageName, "public");

            // Check if game-settings.json exists
            if (fs.existsSync(gameSettingsPath)) {
                try {
                    const gameSettings = require(gameSettingsPath);

                    // Extract the first game configuration (assuming single game per package)
                    const gameIds = Object.keys(gameSettings);
                    if (gameIds.length > 0) {
                        const gameId = parseInt(gameIds[0]);
                        gameConfigs.push({
                            gameSettings: gameSettings,
                            outputPath: path.join(publicDir, "i18n/"),
                            gameId
                        });
                    }
                } catch (error) {
                    console.warn(`[TolgeeGenerator] Failed to load game settings for ${packageName}:`, error.message);
                }
            }
        }
    } catch (error) {
        console.error("[TolgeeGenerator] Error discovering game packages:", error.message);
    }

    return gameConfigs;
};

// Load all available game configurations
const allGameConfigs = loadAllGameConfigs();

// Filter for current game if NEXT_PUBLIC_DEFAULT_GAME_ID is specified
const currentGameId = process.env.NEXT_PUBLIC_DEFAULT_GAME_ID;
let gameConfigsToProcess = allGameConfigs;

if (currentGameId) {
    const targetGameId = parseInt(currentGameId);
    gameConfigsToProcess = allGameConfigs.filter(config => config.gameId === targetGameId);

    if (gameConfigsToProcess.length === 0) {
        console.warn(`[TolgeeGenerator] No game configuration found for game ID ${currentGameId}, processing all games`);
        gameConfigsToProcess = allGameConfigs;
    }
}

// Collect all unique namespaces from all games
const allNamespaces = new Set<string>();
gameConfigsToProcess.forEach(config => {
    Object.values(config.gameSettings).forEach((gameSetting: any) => {
        if (gameSetting.tolgeeNamespace) {
            allNamespaces.add(gameSetting.tolgeeNamespace);
        }
    });
});

// Always include Common and SabaNumber
const namespaces = ["SabaNumber", "Common", ...Array.from(allNamespaces)].filter((value, index, arr) => arr.indexOf(value) === index);

console.log("[TolgeeGenerator] Tolgee generator starting");

// Standalone locales definition
const locales = {
    en: "en",
    vi: "vi",
    th: "th",
    id: "id",
    zh_cn: "zh_cn",
    zh_tw: "zh_tw",
    ms_my: "ms_my",
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

console.log("[TolgeeGenerator] Processing", gameConfigsToProcess.length, "game(s)");
console.log("[TolgeeGenerator] Namespaces:", namespaces);

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

    // Process each language
    for (const languageId of Object.values(locales)) {
        console.log("[TolgeeGenerator] processing language:", languageId);
        await tg.changeLanguage(languageId);
        languages[languageId] = {};

        // Get all records for this language
        tg.getAllRecords().forEach((record) => {
            namespaces.forEach((namespace) => {
                if (record.namespace === namespace) {
                    languages[languageId][namespace] = {};
                    record.data.forEach((value, key) => {
                        languages[languageId][namespace][key] = value as string;
                    });
                }
            });
        });

        // Write files for each game configuration
        for (const gameConfig of gameConfigsToProcess) {
            namespaces.forEach((namespace) => {
                if (languages[languageId][namespace]) {
                    writeFile(`${gameConfig.outputPath}${namespace}/` + languageId, JSON.stringify(languages[languageId][namespace], null, 4));
                }
            });
        }
    }

    console.log("[TolgeeGenerator] initialLoad completed");
});
