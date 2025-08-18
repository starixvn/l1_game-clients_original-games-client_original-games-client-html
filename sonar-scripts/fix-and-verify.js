const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const axios = require("axios");

// Configuration
const SONAR_URL = process.env.SONAR_URL || "https://sonarqube.lumigame.com";
const PROJECT_KEY = process.env.SONAR_PROJECT_KEY || "sedie-multiplayer-client";
const SONAR_TOKEN = process.env.SONAR_TOKEN || "sqa_1f724aecdc0b76fa05c71e38bf4bcb5d6dadaa6b";
const MAX_ATTEMPTS = 5; // Maximum attempts to fix and verify

const axiosConfig = {
    auth: { username: SONAR_TOKEN, password: "" },
    headers: { "Content-Type": "application/json" },
};

function toLocalPath(component) {
    const rel = component.split(":")[1] || component;
    return path.join(process.cwd(), rel.replace(/\\/g, "/"));
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function removeUnusedImportSymbols(source, symbolsToRemove) {
    let updated = source;

    for (const symbol of symbolsToRemove) {
        const symEsc = escapeRegExp(symbol);

        // 1) Remove namespace imports: import * as X from '...';
        updated = updated.replace(new RegExp(`(^|\n)\s*import\s*\\*\s*as\s*${symEsc}\s*from\s*(['"][^'"]+['"]);?\s*`, "g"), "\n");

        // 2) Remove default imports: import X from '...'; or import X, { A, B } from '...';
        updated = updated.replace(
            new RegExp(`(^|\n)\s*import\s*${symEsc}\s*(,\s*\{([^}]*)\})?\s*from\s*(['"][^'"]+['"]);?`, "g"),
            (m, p1, namedGroup) => {
                if (namedGroup) {
                    const namedOnly = namedGroup.replace(/^,\s*/, "");
                    return `\nimport ${namedOnly} from ${m.match(/from\s*(['"][^'"]+['"])/)[1]};`;
                }
                return "\n";
            }
        );

        // 3) Remove from named imports: import { A, B, C } from '...';
        updated = updated.replace(/(^|\n)\s*import\s*\{([^}]*)\}\s*from\s*(['"][^'"]+['"]);?/g, (full, p1, inner, fromPart) => {
            const names = inner
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0 && s !== symbol && s.replace(/\s+as\s+.*/, "") !== symbol);
            if (names.length === 0) {
                return "\n";
            }
            return `\nimport { ${names.join(", ")} } from ${fromPart};`;
        });
    }

    updated = updated.replace(/\n{3,}/g, "\n\n");
    return updated;
}

function parseUnusedImportSymbol(message) {
    const m = message.match(/unused import of '([^']+)'/i);
    return m ? m[1] : null;
}

async function fetchSonarIssues() {
    try {
        const issuesResponse = await axios.get(`${SONAR_URL}/api/issues/search`, {
            ...axiosConfig,
            params: {
                componentKeys: PROJECT_KEY,
                resolved: "false",
                ps: 500,
                facets: "severities,types,rules",
            },
        });

        const qualityGateResponse = await axios.get(`${SONAR_URL}/api/qualitygates/project_status`, {
            ...axiosConfig,
            params: {
                projectKey: PROJECT_KEY,
            },
        });

        const issues = issuesResponse.data.issues || [];
        const qualityGate = qualityGateResponse.data.projectStatus || {};

        return { issues, qualityGate };
    } catch (error) {
        console.error("❌ Error fetching SonarQube issues:", error.message);
        return { issues: [], qualityGate: { status: "UNKNOWN" } };
    }
}

async function applySonarFixes(issues) {
    let changedFiles = 0;
    const issuesByFile = new Map();

    // Group issues by file
    for (const issue of issues) {
        if (issue.rule !== "typescript:S1128") continue; // Only handle unused imports for now
        const symbol = parseUnusedImportSymbol(issue.message);
        if (!symbol) continue;
        const filePath = toLocalPath(issue.component);
        if (!issuesByFile.has(filePath)) issuesByFile.set(filePath, new Set());
        issuesByFile.get(filePath).add(symbol);
    }

    // Apply fixes
    for (const [filePath, symbols] of issuesByFile.entries()) {
        if (!fs.existsSync(filePath)) continue;
        const before = fs.readFileSync(filePath, "utf8");
        const after = removeUnusedImportSymbols(before, Array.from(symbols));
        if (after !== before) {
            fs.writeFileSync(filePath, after, "utf8");
            changedFiles += 1;
            console.log(`✓ Fixed ${symbols.size} unused import(s) in ${path.relative(process.cwd(), filePath)}`);
        }
    }

    return changedFiles;
}

async function fixUnitTestIssues() {
    console.log("🔧 Fixing unit test issues...");

    // Fix the specific test file that's failing
    const testFile = path.join(process.cwd(), "src/components/game-base/handlers/place-bet-wrapper/place-bet-handler.test.ts");

    if (fs.existsSync(testFile)) {
        let content = fs.readFileSync(testFile, "utf8");
        let changed = false;

        // Fix the spy method calls that are failing
        const spyFixes = [
            {
                pattern: /jest\.spyOn\(placeBetHandler, "updateNotConfirmedBetState"\)/g,
                replacement: 'jest.spyOn(placeBetHandler as any, "updateNotConfirmedBetState")',
            },
            {
                pattern: /jest\.spyOn\(placeBetHandler, "sendConfirmBet"\)/g,
                replacement: 'jest.spyOn(placeBetHandler as any, "sendConfirmBet")',
            },
        ];

        for (const fix of spyFixes) {
            if (fix.pattern.test(content)) {
                content = content.replace(fix.pattern, fix.replacement);
                changed = true;
            }
        }

        if (changed) {
            fs.writeFileSync(testFile, content, "utf8");
            console.log("✓ Fixed unit test spy method calls");
            return true;
        }
    }

    return false;
}

async function runTests() {
    console.log("🧪 Running tests...");
    try {
        execSync("npm run test-coverage", { stdio: "inherit" });
        console.log("✅ Tests passed");
        return true;
    } catch (error) {
        console.log("❌ Tests failed, will attempt fixes");
        return false;
    }
}

async function runSonarAnalysis() {
    console.log("📊 Running SonarQube analysis...");
    try {
        execSync("node sonar-scripts/run-sonar.js", { stdio: "inherit" });
        console.log("✅ SonarQube analysis completed");
        return true;
    } catch (error) {
        console.log("❌ SonarQube analysis failed");
        return false;
    }
}

async function waitForAnalysis() {
    console.log("⏳ Waiting for analysis to be processed...");
    await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
}

async function checkQualityGate() {
    try {
        const { qualityGate } = await fetchSonarIssues();
        return qualityGate.status === "OK";
    } catch (error) {
        return false;
    }
}

async function main() {
    console.log("🚀 Starting Automated Fix and Verify Process");
    console.log("=".repeat(60));

    let attempt = 1;
    let qualityGatePassed = false;

    while (attempt <= MAX_ATTEMPTS && !qualityGatePassed) {
        console.log(`\n🔄 Attempt ${attempt}/${MAX_ATTEMPTS}`);
        console.log("-".repeat(40));

        // Step 1: Fix unit test issues
        const testFixed = await fixUnitTestIssues();

        // Step 2: Run tests
        const testsPassed = await runTests();
        if (!testsPassed && !testFixed) {
            console.log("⚠️ Tests still failing and no fixes applied, continuing...");
        }

        // Step 3: Run SonarQube analysis
        const sonarPassed = await runSonarAnalysis();
        if (!sonarPassed) {
            console.log("❌ SonarQube analysis failed, stopping");
            break;
        }

        // Step 4: Wait for analysis to be processed
        await waitForAnalysis();

        // Step 5: Fetch current issues and apply fixes
        const { issues } = await fetchSonarIssues();
        console.log(`📊 Found ${issues.length} issues`);

        if (issues.length > 0) {
            const fixedFiles = await applySonarFixes(issues);
            if (fixedFiles > 0) {
                console.log(`✅ Fixed ${fixedFiles} files`);

                // Run analysis again after fixes
                await runSonarAnalysis();
                await waitForAnalysis();
            } else {
                console.log("⚠️ No automatic fixes could be applied");
            }
        }

        // Step 6: Check quality gate
        qualityGatePassed = await checkQualityGate();

        if (qualityGatePassed) {
            console.log("🎉 Quality Gate PASSED!");
            break;
        } else {
            console.log("❌ Quality Gate still FAILED");
        }

        attempt++;
    }

    // Final status
    if (qualityGatePassed) {
        console.log("\n🎉 SUCCESS: All issues resolved and Quality Gate passed!");
    } else {
        console.log("\n⚠️ WARNING: Could not resolve all issues within maximum attempts");
        console.log("📊 Final status:");

        const { issues, qualityGate } = await fetchSonarIssues();
        console.log(`   - Remaining issues: ${issues.length}`);
        console.log(`   - Quality Gate: ${qualityGate.status}`);

        if (issues.length > 0) {
            console.log("\n📋 Remaining issues:");
            issues.forEach((issue) => {
                console.log(`   - ${issue.component.split(":")[1]}:${issue.line} - ${issue.message}`);
            });
        }
    }

    console.log("\n📁 Check the 'sonar-reports' directory for detailed reports");
}

// Run the main function
main().catch((error) => {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
});
