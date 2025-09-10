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

        // Replace @shared/merged/ imports with @shared/ imports
        const patterns = [
            // @shared/merged/_shared/... -> @shared/...
            {
                regex: /import\s+(.+?)\s+from\s+['"]@shared\/merged\/_shared\/(.+?)['"]/g,
                replacement: "import $1 from '@shared/$2'",
            },
            // @shared/merged/... (dynamic imports)
            {
                regex: /import\s*\(\s*['"]@shared\/merged\/(.+?)['"]/g,
                replacement: "import('@shared/$1'",
            },
            // @shared/merged/... (regular imports)
            {
                regex: /import\s+(.+?)\s+from\s+['"]@shared\/merged\/(.+?)['"]/g,
                replacement: "import $1 from '@shared/$2'",
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

// Process shared package
const sharedDir = path.join(__dirname, "packages", "shared", "src");
if (fs.existsSync(sharedDir)) {
    const sharedFiles = getAllFiles(sharedDir);
    sharedFiles.forEach(updateImportsInFile);
}

console.log("Shared package import path updates completed!");
