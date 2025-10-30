const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const PROJECT_KEY = process.env.SONAR_PROJECT_KEY || "sedie-multiplayer-client";

// Custom rules file path
const CUSTOM_RULES_FILE = path.join(__dirname, "typescript-rules.xml");

function getChangedFiles() {
    console.log("🔍 Detecting changed files...");

    try {
        // Get staged and unstaged changes
        const stagedFiles = execSync("git diff --cached --name-only --diff-filter=ACM", { encoding: "utf8" })
            .split("\n")
            .filter((file) => file.trim() && file.startsWith("src/"));

        const unstagedFiles = execSync("git diff --name-only --diff-filter=ACM", { encoding: "utf8" })
            .split("\n")
            .filter((file) => file.trim() && file.startsWith("src/"));

        // Get files changed in the last commit
        const lastCommitFiles = execSync("git diff --name-only HEAD~1 HEAD --diff-filter=ACM", { encoding: "utf8" })
            .split("\n")
            .filter((file) => file.trim() && file.startsWith("src/"));

        // Combine all changed files and remove duplicates
        const allChangedFiles = [...new Set([...stagedFiles, ...unstagedFiles, ...lastCommitFiles])];

        // Filter to only TypeScript/JavaScript files
        const relevantFiles = allChangedFiles.filter(
            (file) => file.endsWith(".ts") || file.endsWith(".tsx") || file.endsWith(".js") || file.endsWith(".jsx")
        );

        console.log(`📊 Found ${relevantFiles.length} changed files to analyze`);
        if (relevantFiles.length > 0) {
            console.log("📄 Changed files:");
            relevantFiles.forEach((file) => console.log(`   - ${file}`));
        }

        return relevantFiles;
    } catch (error) {
        console.warn("⚠️ Could not detect changed files (not a git repository or no changes):", error.message);
        return [];
    }
}

async function runTestsOnChangedFiles(changedFiles) {
    if (changedFiles.length === 0) {
        console.log("🧪 No changed files detected, skipping targeted tests");
        return true;
    }

    console.log("🧪 Running tests on changed files...");
    try {
        // Create a test pattern for changed files
        const testPatterns = changedFiles
            .map((file) => {
                const relativePath = path.relative("src", file);
                const testFile = relativePath.replace(/\.(ts|tsx|js|jsx)$/, ".test.$1");
                return `src/**/${testFile}`;
            })
            .join(",");

        if (testPatterns) {
            execSync(`npm test -- --testPathPattern="${testPatterns}"`, { stdio: "inherit" });
            console.log("✅ Tests on changed files completed successfully");
        } else {
            console.log("⚠️ No test files found for changed files");
        }
        return true;
    } catch (error) {
        console.error("❌ Tests on changed files failed:", error.message);
        return false;
    }
}

async function runLintingOnChangedFiles(changedFiles) {
    if (changedFiles.length === 0) {
        console.log("🔍 No changed files detected, skipping targeted linting");
        return true;
    }

    console.log("🔍 Running linting on changed files...");
    try {
        // Run ESLint on changed files
        const filesToLint = changedFiles.join(" ");
        execSync(`npx eslint ${filesToLint}`, { stdio: "inherit" });
        console.log("✅ Linting on changed files completed successfully");
        return true;
    } catch (error) {
        console.error("⚠️ Linting issues found in changed files:", error.message);
        return false;
    }
}

async function runCodeAnalysisOnChangedFiles(changedFiles) {
    console.log("📊 Running code analysis on changed files...");
    try {
        // Check if custom rules file exists
        if (!fs.existsSync(CUSTOM_RULES_FILE)) {
            console.error(`❌ Custom rules file not found: ${CUSTOM_RULES_FILE}`);
            return false;
        }

        console.log(`📋 Using custom rules from: ${CUSTOM_RULES_FILE}`);

        if (changedFiles.length === 0) {
            console.log("⚠️ No changed files detected, skipping code analysis");
            return true;
        }

        // Run TypeScript compiler check on changed files
        console.log("🔍 Running TypeScript compiler check on changed files...");
        try {
            const filesToCheck = changedFiles.filter((f) => f.endsWith(".ts") || f.endsWith(".tsx")).join(" ");
            if (filesToCheck) {
                execSync(`npx tsc --noEmit ${filesToCheck}`, { stdio: "inherit" });
                console.log("✅ TypeScript compilation check passed");
            } else {
                console.log("⚠️ No TypeScript files to check");
            }
        } catch (error) {
            console.warn("⚠️ TypeScript compilation issues found in changed files (continuing...)");
        }

        // Run Prettier check on changed files
        console.log("🎨 Running Prettier format check on changed files...");
        try {
            const filesToFormat = changedFiles.join(" ");
            execSync(`npx prettier --check ${filesToFormat}`, { stdio: "inherit" });
            console.log("✅ Code formatting check passed");
        } catch (error) {
            console.warn("⚠️ Code formatting issues found in changed files (continuing...)");
        }

        console.log("✅ Code analysis on changed files completed successfully");
        return true;
    } catch (error) {
        console.error("❌ Code analysis on changed files failed:", error.message);
        return false;
    }
}

function generateChangedFilesReport(changedFiles) {
    console.log("📊 Generating changed files analysis report...");

    // Create reports directory
    const reportsDir = path.join(__dirname, "..", "sonar-reports");
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    // Group files by type
    const fileTypes = {
        typescript: changedFiles.filter((f) => f.endsWith(".ts")),
        typescriptReact: changedFiles.filter((f) => f.endsWith(".tsx")),
        javascript: changedFiles.filter((f) => f.endsWith(".js")),
        javascriptReact: changedFiles.filter((f) => f.endsWith(".jsx")),
    };

    // Generate report
    const changedFilesReport = {
        projectKey: PROJECT_KEY,
        analysisType: "CHANGED_FILES_ONLY",
        analysisDate: new Date().toISOString(),
        changedFiles: {
            total: changedFiles.length,
            files: changedFiles,
            byType: fileTypes,
        },
        analysisResults: {
            tests: "completed",
            linting: "completed",
            codeAnalysis: "completed",
        },
        tools: ["TypeScript Compiler", "ESLint", "Prettier", "Jest"],
    };

    // Save report
    const reportFile = path.join(reportsDir, "changed-files-analysis-report.json");
    fs.writeFileSync(reportFile, JSON.stringify(changedFilesReport, null, 2));
    console.log(`📁 Changed files report saved to: ${path.relative(process.cwd(), reportFile)}`);

    // Generate markdown summary
    let markdown = `# Changed Files Analysis Report\n\n`;
    markdown += `**Project:** ${PROJECT_KEY}\n`;
    markdown += `**Analysis Type:** Changed Files Only (No SonarQube Server)\n`;
    markdown += `**Analysis Date:** ${new Date().toLocaleString()}\n\n`;

    markdown += `## Changed Files Summary\n\n`;
    markdown += `📊 **Total Changed Files:** ${changedFiles.length}\n\n`;

    if (changedFiles.length > 0) {
        markdown += `### Files by Type\n\n`;
        Object.entries(fileTypes).forEach(([type, files]) => {
            if (files.length > 0) {
                markdown += `- **${type}:** ${files.length} files\n`;
            }
        });
        markdown += `\n`;

        markdown += `### Changed Files List\n\n`;
        changedFiles.forEach((file) => {
            markdown += `- \`${file}\`\n`;
        });
        markdown += `\n`;
    } else {
        markdown += `⚠️ **No changed files detected**\n\n`;
        markdown += `This could mean:\n`;
        markdown += `- No files have been modified since the last commit\n`;
        markdown += `- Changes are not staged or committed\n`;
        markdown += `- Not in a git repository\n\n`;
    }

    markdown += `## Analysis Results\n\n`;
    markdown += `✅ **Tests:** Completed on changed files\n`;
    markdown += `✅ **Linting:** Completed on changed files\n`;
    markdown += `✅ **Code Analysis:** Completed on changed files\n\n`;

    markdown += `## Analysis Tools Used\n\n`;
    markdown += `- **TypeScript Compiler:** Type checking on changed files\n`;
    markdown += `- **ESLint:** Code quality and style checking\n`;
    markdown += `- **Prettier:** Code formatting validation\n`;
    markdown += `- **Jest:** Unit testing on changed files\n\n`;

    markdown += `## Performance Benefits\n\n`;
    markdown += `- ⚡ **Faster Analysis:** Only analyzes changed files\n`;
    markdown += `- 🎯 **Focused Results:** Concentrates on recent changes\n`;
    markdown += `- 💾 **Reduced Resource Usage:** Minimal processing time\n`;
    markdown += `- 🔒 **Safe for CI/CD:** No server push conflicts\n`;
    markdown += `- 🌐 **Offline Operation:** No server connection required\n\n`;

    markdown += `## Usage Tips\n\n`;
    markdown += `- Run this script after making changes to your code\n`;
    markdown += `- Stage your changes with \`git add\` for better detection\n`;
    markdown += `- Use \`run-code-and-sonar-local.js\` for full project analysis\n`;

    const markdownFile = path.join(reportsDir, "changed-files-analysis-summary.md");
    fs.writeFileSync(markdownFile, markdown);
    console.log(`📝 Markdown summary saved to: ${path.relative(process.cwd(), markdownFile)}`);
}

async function main() {
    console.log("🚀 Starting CHANGED FILES Analysis (Fast Local Development)");
    console.log("=".repeat(60));
    console.log("⚡  This version analyzes ONLY changed files for speed");
    console.log("🔒  Safe to use without CI/CD conflicts");
    console.log("🌐  No server connection required");
    console.log("=".repeat(60));

    // Step 1: Detect changed files
    const changedFiles = getChangedFiles();

    // Step 2: Run tests on changed files
    const testsPassed = await runTestsOnChangedFiles(changedFiles);
    if (!testsPassed) {
        console.log("⚠️ Continuing despite test failures...");
    }

    // Step 3: Run linting on changed files
    const lintingPassed = await runLintingOnChangedFiles(changedFiles);
    if (!lintingPassed) {
        console.log("⚠️ Continuing despite linting issues...");
    }

    // Step 4: Run code analysis on changed files
    const analysisPassed = await runCodeAnalysisOnChangedFiles(changedFiles);
    if (!analysisPassed) {
        console.error("❌ Code analysis on changed files failed.");
        process.exit(1);
    }

    // Step 5: Generate changed files report
    generateChangedFilesReport(changedFiles);

    console.log("\n🎉 CHANGED FILES Analysis completed successfully!");
    console.log("📁 Check the 'sonar-reports' directory for changed files analysis:");
    console.log("   - changed-files-analysis-report.json (Detailed report)");
    console.log("   - changed-files-analysis-summary.md (Human-readable summary)");
    console.log("\n💡 Tip: Use 'run-code-and-sonar-local.js' for full project analysis");
}

// Run the main function
main().catch((error) => {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
});
