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

        // Replace @shared/_shared/... imports with @shared/... imports
        const patterns = [
            // @shared/_shared/... -> @shared/...
            {
                regex: /import\s+(.+?)\s+from\s+['"]@shared\/_shared\/(.+?)['"]/g,
                replacement: "import $1 from '@shared/$2'",
            },
            // @shared/_shared/... (dynamic imports)
            {
                regex: /import\s*\(\s*['"]@shared\/_shared\/(.+?)['"]/g,
                replacement: "import('@shared/$1'",
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

// Process packages
const packagesDir = path.join(__dirname, "packages");
if (fs.existsSync(packagesDir)) {
    const allFiles = getAllFiles(packagesDir);
    allFiles.forEach(updateImportsInFile);
}

console.log("Remaining alias import path updates completed!");

