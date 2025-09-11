const fs = require("fs");
const path = require("path");

// Function to recursively find all TypeScript/JavaScript files
function findFiles(dir, extensions = [".ts", ".tsx", ".js", ".jsx"]) {
    let results = [];
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat && stat.isDirectory()) {
            // Skip node_modules and .next directories
            if (!file.startsWith(".") && file !== "node_modules") {
                results = results.concat(findFiles(filePath, extensions));
            }
        } else if (extensions.some((ext) => file.endsWith(ext))) {
            results.push(filePath);
        }
    });

    return results;
}

// Function to fix import statements
function fixImports(content) {
    // Fix malformed @shared imports with extra quotes
    content = content.replace(/from '@shared\/([^"]*)"\s*;/g, "from '@shared/$1';");

    // Fix any other malformed imports
    content = content.replace(/from "@([^"]*)"\s*;/g, 'from "@$1";');

    // Fix missing comma in import statements
    content = content.replace(/(\w+),(\w+)from\s+'@shared/g, "$1, $2 from '@shared");

    // Fix missing space before from
    content = content.replace(/(\w+)from\s+'@shared/g, "$1 from '@shared");

    // Fix missing semicolon at end of import
    content = content.replace(/from '@shared\/([^"]*)"\s*$/gm, "from '@shared/$1';");

    // Fix relative imports to @shared
    content = content.replace(/from "\.\.\/\.\.\/components\/game-base\/type"/g, 'from "@shared/components/game-base/type"');
    content = content.replace(/from "\.\.\/\.\.\/components\/game-base\/handlers"/g, 'from "@shared/components/game-base/handlers"');
    content = content.replace(/from "\.\.\/\.\.\/components\/game-components\//g, 'from "@shared/components/game-components/');
    content = content.replace(/from "\.\.\/\.\.\/components\/page-components\//g, 'from "@shared/components/page-components/');
    content = content.replace(/from "\.\.\/\.\.\/helpers\//g, 'from "@shared/helpers/');
    content = content.replace(/from "\.\.\/\.\.\/react-contexts\//g, 'from "@shared/react-contexts/');
    content = content.replace(/from "\.\.\/\.\.\/react-hooks\//g, 'from "@shared/react-hooks/');
    content = content.replace(/from "\.\.\/\.\.\/stores\//g, 'from "@shared/stores/');
    content = content.replace(/from "\.\.\/\.\.\/utils\//g, 'from "@shared/utils/');
    content = content.replace(/from "\.\.\/\.\.\/constants\//g, 'from "@shared/constants/');
    content = content.replace(/from "\.\.\/\.\.\/resources\//g, 'from "@shared/resources/');

    // Fix other relative import patterns
    content = content.replace(/from "\.\/\.\.\/\.\.\/components\/game-base\/type"/g, 'from "@shared/components/game-base/type"');
    content = content.replace(/from "\.\/\.\.\/\.\.\/components\/game-base\/handlers"/g, 'from "@shared/components/game-base/handlers"');
    content = content.replace(/from "\.\/\.\.\/\.\.\/components\/game-components\//g, 'from "@shared/components/game-components/');
    content = content.replace(/from "\.\/\.\.\/\.\.\/components\/page-components\//g, 'from "@shared/components/page-components/');
    content = content.replace(/from "\.\/\.\.\/\.\.\/helpers\//g, 'from "@shared/helpers/');
    content = content.replace(/from "\.\/\.\.\/\.\.\/react-contexts\//g, 'from "@shared/react-contexts/');
    content = content.replace(/from "\.\/\.\.\/\.\.\/react-hooks\//g, 'from "@shared/react-hooks/');
    content = content.replace(/from "\.\/\.\.\/\.\.\/stores\//g, 'from "@shared/stores/');
    content = content.replace(/from "\.\/\.\.\/\.\.\/utils\//g, 'from "@shared/utils/');
    content = content.replace(/from "\.\/\.\.\/\.\.\/constants\//g, 'from "@shared/constants/');
    content = content.replace(/from "\.\/\.\.\/\.\.\/resources\//g, 'from "@shared/resources/');

    // Fix three-level relative imports
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/components\/game-base\/type"/g, 'from "@shared/components/game-base/type"');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/components\/game-base\/handlers"/g, 'from "@shared/components/game-base/handlers"');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/components\/game-components\//g, 'from "@shared/components/game-components/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/components\/page-components\//g, 'from "@shared/components/page-components/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/helpers\//g, 'from "@shared/helpers/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/react-contexts\//g, 'from "@shared/react-contexts/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/react-hooks\//g, 'from "@shared/react-hooks/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/stores\//g, 'from "@shared/stores/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/utils\//g, 'from "@shared/utils/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/constants\//g, 'from "@shared/constants/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/resources\//g, 'from "@shared/resources/');

    // Fix four-level relative imports
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/components\/game-base\/type"/g, 'from "@shared/components/game-base/type"');
    content = content.replace(
        /from "\.\.\/\.\.\/\.\.\/\.\.\/components\/game-base\/handlers"/g,
        'from "@shared/components/game-base/handlers"'
    );
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/components\/game-components\//g, 'from "@shared/components/game-components/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/components\/page-components\//g, 'from "@shared/components/page-components/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/helpers\//g, 'from "@shared/helpers/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/react-contexts\//g, 'from "@shared/react-contexts/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/react-hooks\//g, 'from "@shared/react-hooks/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/stores\//g, 'from "@shared/stores/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/utils\//g, 'from "@shared/utils/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/constants\//g, 'from "@shared/constants/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/resources\//g, 'from "@shared/resources/');

    // Fix services imports
    content = content.replace(/from "\.\.\/\.\.\/services\//g, 'from "@shared/services/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/services\//g, 'from "@shared/services/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/services\//g, 'from "@shared/services/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/services\//g, 'from "@shared/services/');

    // Fix handlers imports
    content = content.replace(/from "\.\.\/\.\.\/components\/game-base\/handlers\//g, 'from "@shared/components/game-base/handlers/');
    content = content.replace(/from "\.\.\/\.\.\/\.\.\/components\/game-base\/handlers\//g, 'from "@shared/components/game-base/handlers/');
    content = content.replace(
        /from "\.\.\/\.\.\/\.\.\/\.\.\/components\/game-base\/handlers\//g,
        'from "@shared/components/game-base/handlers/'
    );
    content = content.replace(
        /from "\.\.\/\.\.\/\.\.\/\.\.\/\.\.\/components\/game-base\/handlers\//g,
        'from "@shared/components/game-base/handlers/'
    );

    return content;
}

// Main function
function main() {
    const sharedDir = path.join(__dirname, "../shared/src");

    if (!fs.existsSync(sharedDir)) {
        console.log("Shared directory not found:", sharedDir);
        return;
    }

    const files = findFiles(sharedDir);
    let fixedCount = 0;

    files.forEach((file) => {
        try {
            const content = fs.readFileSync(file, "utf8");
            const fixedContent = fixImports(content);

            if (content !== fixedContent) {
                fs.writeFileSync(file, fixedContent, "utf8");
                console.log("Fixed:", path.relative(process.cwd(), file));
                fixedCount++;
            }
        } catch (error) {
            console.error("Error processing file:", file, error.message);
        }
    });

    console.log(`\nFixed ${fixedCount} files`);
}

main();
