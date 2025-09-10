const fs = require("fs");
const path = require("path");

// Function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(function (file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else if (file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".jsx")) {
            arrayOfFiles.push(fullPath);
        }
    });

    return arrayOfFiles;
}

// Function to update imports in a file
function updateImportsInFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, "utf8");
        let updated = false;

        // Replace relative imports with @shared/ imports
        const patterns = [
            // ../_shared/... -> @shared/...
            {
                regex: /import\s+(.+?)\s+from\s+['"](\.\.\/)(_shared\/.+?)['"]/g,
                replacement: "import $1 from '@shared/$3'",
            },
            // ../../_shared/... -> @shared/...
            {
                regex: /import\s+(.+?)\s+from\s+['"](\.\.\/\.\.\/)(_shared\/.+?)['"]/g,
                replacement: "import $1 from '@shared/$3'",
            },
            // ../components/... -> @shared/components/...
            {
                regex: /import\s+(.+?)\s+from\s+['"](\.\.\/)(components\/.+?)['"]/g,
                replacement: "import $1 from '@shared/$3'",
            },
            // ../../components/... -> @shared/components/...
            {
                regex: /import\s+(.+?)\s+from\s+['"](\.\.\/\.\.\/)(components\/.+?)['"]/g,
                replacement: "import $1 from '@shared/$3'",
            },
            // ../services/... -> @shared/services/...
            {
                regex: /import\s+(.+?)\s+from\s+['"](\.\.\/)(services\/.+?)['"]/g,
                replacement: "import $1 from '@shared/$3'",
            },
            // ../styles/... -> @shared/styles/...
            {
                regex: /import\s+(.+?)\s+from\s+['"](\.\.\/)(styles\/.+?)['"]/g,
                replacement: "import $1 from '@shared/$3'",
            },
        ];

        patterns.forEach((pattern) => {
            const newContent = content.replace(pattern.regex, pattern.replacement);
            if (newContent !== content) {
                content = newContent;
                updated = true;
            }
        });

        // Write the updated content back to the file
        if (updated) {
            fs.writeFileSync(filePath, content, "utf8");
            console.log(`Updated: ${path.relative(process.cwd(), filePath)}`);
        }
    } catch (error) {
        console.error(`Error updating ${filePath}:`, error.message);
    }
}

// Process pages directory
const pagesDir = path.join(__dirname, "packages", "sedie-multiplayer", "src", "pages");
if (fs.existsSync(pagesDir)) {
    const pageFiles = getAllFiles(pagesDir);
    pageFiles.forEach(updateImportsInFile);
}

console.log("Pages import path updates completed!");
