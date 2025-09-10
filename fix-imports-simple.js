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

        // Update imports in sedie-multiplayer package
        if (filePath.includes("packages/sedie-multiplayer/src")) {
            const originalContent = content;

            // Convert relative imports to @shared/merged imports for shared code
            content = content.replace(/import\s+(.+?)\s+from\s+['"](\.\.\/\.\.\/)(.+?)['"]/g, (match, imports, dots, relativePath) => {
                return `import ${imports} from '@shared/merged/${relativePath}'`;
            });

            content = content.replace(/import\s+(.+?)\s+from\s+['"](\.\.\/)(.+?)['"]/g, (match, imports, dots, relativePath) => {
                if (
                    relativePath.startsWith("_shared/") ||
                    relativePath.startsWith("components/") ||
                    relativePath.startsWith("services/") ||
                    relativePath.startsWith("styles/")
                ) {
                    return `import ${imports} from '@shared/merged/${relativePath}'`;
                }
                return match;
            });

            // Convert absolute imports to @shared/merged imports
            content = content.replace(
                /import\s+(.+?)\s+from\s+['"](src\/_shared\/|src\/components\/|src\/services\/|src\/styles\/)(.+?)['"]/g,
                (match, imports, prefix, relativePath) => {
                    return `import ${imports} from '@shared/merged/${relativePath}'`;
                }
            );

            updated = content !== originalContent;
        }

        // Update imports in shared package
        if (filePath.includes("packages/shared/src")) {
            const originalContent = content;

            // Convert relative imports to @shared/merged imports
            content = content.replace(/import\s+(.+?)\s+from\s+['"](\.\.\/\.\.\/)(.+?)['"]/g, (match, imports, dots, relativePath) => {
                return `import ${imports} from '@shared/merged/${relativePath}'`;
            });

            content = content.replace(/import\s+(.+?)\s+from\s+['"](\.\.\/)(.+?)['"]/g, (match, imports, dots, relativePath) => {
                return `import ${imports} from '@shared/merged/${relativePath}'`;
            });

            updated = content !== originalContent;
        }

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

// Process sedie-multiplayer package
const sedieDir = path.join(__dirname, "packages", "sedie-multiplayer", "src");
if (fs.existsSync(sedieDir)) {
    const sedieFiles = getAllFiles(sedieDir);
    sedieFiles.forEach(updateImportsInFile);
}

console.log("Import path updates completed!");
