const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { execSync } = require("child_process");

// Configuration (override via env vars)
const SONAR_URL = process.env.SONAR_URL || "https://sonarqube.lumigame.com";
const PROJECT_KEY = process.env.SONAR_PROJECT_KEY || "sedie-multiplayer-client";
const SONAR_TOKEN = process.env.SONAR_TOKEN || ""; // REQUIRED

if (!SONAR_TOKEN) {
    console.error("SONAR_TOKEN env var is required (use your sqa_ token)");
    process.exit(1);
}

const axiosConfig = {
    auth: { username: SONAR_TOKEN, password: "" },
    headers: { "Content-Type": "application/json" },
};

function toLocalPath(component) {
    // component like: projectKey:src/path/file.ts
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
                    // keep only named part
                    const namedOnly = namedGroup.replace(/^,\s*/, "");
                    return `\nimport ${namedOnly} from ${m.match(/from\s*(['"][^'"]+['"])/)[1]};`;
                }
                return "\n"; // remove entire import line
            }
        );

        // 3) Remove from named imports: import { A, B, C } from '...';
        updated = updated.replace(/(^|\n)\s*import\s*\{([^}]*)\}\s*from\s*(['"][^'"]+['"]);?/g, (full, p1, inner, fromPart) => {
            const names = inner
                .split(",")
                .map((s) => s.trim())
                .filter((s) => s.length > 0 && s !== symbol && s.replace(/\s+as\s+.*/, "") !== symbol);
            if (names.length === 0) {
                return "\n"; // remove now-empty import
            }
            return `\nimport { ${names.join(", ")} } from ${fromPart};`;
        });
    }

    // Cleanup multiple blank lines
    updated = updated.replace(/\n{3,}/g, "\n\n");
    return updated;
}

async function fetchOpenIssues() {
    const issuesResponse = await axios.get(`${SONAR_URL}/api/issues/search`, {
        ...axiosConfig,
        params: {
            componentKeys: PROJECT_KEY,
            resolved: "false",
            ps: 500,
            facets: "severities,types,rules",
        },
    });
    return issuesResponse.data.issues || [];
}

function parseUnusedImportSymbol(message) {
    // e.g. "Remove this unused import of 'DefaultParamType'."
    const m = message.match(/unused import of '([^']+)'/i);
    return m ? m[1] : null;
}

async function applyAutoFixes(issues) {
    // Support: typescript:S1128 (unused import)
    const issuesByFile = new Map();
    for (const issue of issues) {
        if (issue.rule !== "typescript:S1128") continue;
        const symbol = parseUnusedImportSymbol(issue.message);
        if (!symbol) continue;
        const filePath = toLocalPath(issue.component);
        if (!issuesByFile.has(filePath)) issuesByFile.set(filePath, new Set());
        issuesByFile.get(filePath).add(symbol);
    }

    let changedFiles = 0;
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

async function run() {
    console.log("🚀 Pulling SonarQube issues...");
    const issuesBefore = await fetchOpenIssues();
    console.log(`Found ${issuesBefore.length} open issue(s).`);

    console.log("🛠️ Applying auto-fixes (supported: typescript:S1128)...");
    const changed = await applyAutoFixes(issuesBefore);
    console.log(`Modified ${changed} file(s).`);

    if (changed > 0) {
        console.log("📦 Running Sonar analysis (push results)...");
        // Ensure SONAR_TOKEN env is available to run-sonar.js
        execSync("node run-sonar.js", { stdio: "inherit", env: { ...process.env } });
    } else {
        console.log("No changes needed; skipping analysis run.");
    }

    console.log("🔄 Verifying remaining issues...");
    const issuesAfter = await fetchOpenIssues();
    console.log(`Remaining open issues: ${issuesAfter.length}`);

    // Write a small summary
    const reportsDir = path.join(process.cwd(), "sonar-reports");
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
    const summaryPath = path.join(reportsDir, "auto-fix-summary.md");
    fs.writeFileSync(
        summaryPath,
        `# Auto Fix Summary\n\n- Changed files: ${changed}\n- Issues before: ${issuesBefore.length}\n- Issues after: ${
            issuesAfter.length
        }\n- Timestamp: ${new Date().toISOString()}\n`,
        "utf8"
    );
    console.log(`📝 Summary saved to: ${path.relative(process.cwd(), summaryPath)}`);
}

run().catch((err) => {
    console.error("❌ Failed:", err.message);
    process.exit(1);
});
