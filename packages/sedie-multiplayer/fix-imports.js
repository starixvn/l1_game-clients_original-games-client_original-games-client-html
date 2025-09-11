const fs = require("fs");
const path = require("path");

function fixImportsInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, "utf8");

        // Fix the broken import pattern: from '@shared/..."; -> from '@shared/...';
        content = content.replace(/from '@shared\/([^']*)"\s*;/g, "from '@shared/$1';");

        // Fix the pattern: from '@shared/..."; -> from '@shared/...';
        content = content.replace(/from '@shared\/([^"]*)"\s*;/g, "from '@shared/$1';");

        // Fix the pattern: from "./...'; -> from "./...";
        content = content.replace(/from "\.\/([^']*)'\s*;/g, 'from "./$1";');

        // Fix the pattern: from "../...'; -> from "../...";
        content = content.replace(/from "\.\.\/([^']*)'\s*;/g, 'from "../$1";');

        // Fix broken string literals: || "'; -> || "";
        content = content.replace(/\|\| "';/g, '|| "";');

        // Fix relative imports to use @shared
        content = content.replace(/from "\.\.\/\.\.\/\.\.\/components\/game-base\/type"/g, 'from "@shared/components/game-base/type"');
        content = content.replace(/from "\.\.\/\.\.\/\.\.\/components\/game-components\//g, 'from "@shared/components/game-components/');
        content = content.replace(/from "\.\.\/\.\.\/\.\.\/components\/game-base\//g, 'from "@shared/components/game-base/');

        // Fix dynamic imports
        content = content.replace(
            /import\("\.\.\/\.\.\/\.\.\/components\/game-components\//g,
            'import("@shared/components/game-components/'
        );
        content = content.replace(/import\("\.\.\/\.\.\/\.\.\/components\/game-base\//g, 'import("@shared/components/game-base/');

        // Fix more relative imports
        content = content.replace(/from "\.\.\/\.\.\/game-base\/type"/g, 'from "@shared/components/game-base/type"');
        content = content.replace(/from "\.\.\/\.\.\/game-base\//g, 'from "@shared/components/game-base/');
        content = content.replace(/from "\.\.\/\.\.\/game-components\//g, 'from "@shared/components/game-components/');

        // Fix services imports
        content = content.replace(/from "\.\.\/services\/auth-service"/g, 'from "@shared/services/auth-service"');
        content = content.replace(/from "\.\.\/services\/user-setting-service"/g, 'from "@shared/services/user-setting-service"');

        // Fix local component imports
        content = content.replace(/from "\.\/fade-content"/g, 'from "@shared/components/page-components/splash-screen/fade-content"');

        // Fix more dynamic imports
        content = content.replace(/import\("\.\.\/um-page"\)/g, 'import("@shared/components/page-components/um-page")');
        content = content.replace(/import\("\.\.\/dashboard"\)/g, 'import("@shared/components/page-components/dashboard")');

        // Fix more relative imports
        content = content.replace(/from "\.\.\/\.\.\/components\/game-base\/"/g, 'from "@shared/components/game-base/"');
        content = content.replace(/from "\.\.\/\.\.\/components\/game-base\//g, 'from "@shared/components/game-base/');
        content = content.replace(/from "\.\.\/\.\.\/components\/round-base\//g, 'from "@shared/components/round-base/');

        // Fix more game-components imports
        content = content.replace(/from "\.\.\/\.\.\/components\/game-components\//g, 'from "@shared/components/game-components/');

        // Fix more dynamic imports
        content = content.replace(/import\("\.\.\/\.\.\/components\/game-components\//g, 'import("@shared/components/game-components/');

        // Fix more relative imports
        content = content.replace(/from "\.\.\/components\/game-components\//g, 'from "@shared/components/game-components/');
        content = content.replace(/from "\.\.\/components\/page-components\//g, 'from "@shared/components/page-components/');

        // Fix more relative imports
        content = content.replace(/from "\.\/components\/game-base\/"/g, 'from "@shared/components/game-base/"');
        content = content.replace(/from "\.\/components\/game-base\//g, 'from "@shared/components/game-base/');
        content = content.replace(/from "\.\/components\/round-base\//g, 'from "@shared/components/round-base/');

        // Fix more relative imports
        content = content.replace(/from "\.\/sedie-multiplayer-constants"/g, 'from "../sedie-multiplayer-constants"');
        content = content.replace(
            /from "\.\/sedie-multiplayer-game-round-data-handler"/g,
            'from "../sedie-multiplayer-game-round-data-handler"'
        );
        content = content.replace(/from "\.\/result-block\//g, 'from "../result-block/');
        content = content.replace(/from "\.\/sedie-multiplayer-betting-block"/g, 'from "../sedie-multiplayer-betting-block"');

        // Fix more relative imports
        content = content.replace(/from "\.\.\/sedie-multiplayer-constants"/g, 'from "./sedie-multiplayer-constants"');
        content = content.replace(
            /from "\.\.\/sedie-multiplayer-game-round-data-handler"/g,
            'from "./sedie-multiplayer-game-round-data-handler"'
        );
        content = content.replace(/from "\.\.\/result-block\//g, 'from "./result-block/');
        content = content.replace(/from "\.\.\/sedie-multiplayer-betting-block"/g, 'from "./sedie-multiplayer-betting-block"');

        // Fix more relative imports
        content = content.replace(/from "\.\/sedie-multiplayer-constants"/g, 'from "../sedie-multiplayer-constants"');
        content = content.replace(/from "\.\/sedie-sub-option"/g, 'from "./sedie-sub-option"');
        content = content.replace(/from "\.\/sedie-main-option"/g, 'from "./sedie-main-option"');

        // Fix more relative imports
        content = content.replace(/from "\.\.\/sedie-multiplayer-constants"/g, 'from "./sedie-multiplayer-constants"');
        content = content.replace(
            /from "\.\.\/sedie-multiplayer-game-round-data-handler"/g,
            'from "./sedie-multiplayer-game-round-data-handler"'
        );
        content = content.replace(/from "\.\.\/result-block\//g, 'from "./result-block/');
        content = content.replace(/from "\.\.\/sedie-multiplayer-betting-block"/g, 'from "./sedie-multiplayer-betting-block"');

        fs.writeFileSync(filePath, content, "utf8");
        console.log(`Fixed imports in: ${filePath}`);
    } catch (error) {
        console.error(`Error fixing ${filePath}:`, error.message);
    }
}

function walkDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            walkDirectory(filePath);
        } else if (file.endsWith(".ts") || file.endsWith(".tsx")) {
            fixImportsInFile(filePath);
        }
    }
}

// Start from the src directory
walkDirectory("./src");
console.log("Import fixing completed!");
