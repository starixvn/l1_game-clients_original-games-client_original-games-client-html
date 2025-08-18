const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const axios = require("axios");

// Configuration
const SONAR_URL = process.env.SONAR_URL || "https://sonarqube.lumigame.com";
const PROJECT_KEY = process.env.SONAR_PROJECT_KEY || "sedie-multiplayer-client";
const SONAR_TOKEN = process.env.SONAR_TOKEN || "sqa_1f724aecdc0b76fa05c71e38bf4bcb5d6dadaa6b";

// Custom rules file path
const CUSTOM_RULES_FILE = path.join(__dirname, "typescript-rules.xml");

async function runTests() {
    console.log("🧪 Running tests and generating coverage...");
    try {
        execSync("npm run test-coverage", { stdio: "inherit" });
        console.log("✅ Tests completed successfully");
        return true;
    } catch (error) {
        console.error("❌ Tests failed:", error.message);
        return false;
    }
}

async function runLinting() {
    console.log("🔍 Running linting...");
    try {
        execSync("npm run lint", { stdio: "inherit" });
        console.log("✅ Linting completed successfully");
        return true;
    } catch (error) {
        console.error("⚠️ Linting issues found:", error.message);
        return false;
    }
}

async function runSonarAnalysis() {
    console.log("📊 Running SonarQube analysis with custom rules...");
    try {
        // Check if custom rules file exists
        if (!fs.existsSync(CUSTOM_RULES_FILE)) {
            console.error(`❌ Custom rules file not found: ${CUSTOM_RULES_FILE}`);
            return false;
        }

        console.log(`📋 Using custom rules from: ${CUSTOM_RULES_FILE}`);

        // Run SonarQube analysis
        execSync("node " + path.join(__dirname, "run-sonar.js"), { stdio: "inherit" });
        console.log("✅ SonarQube analysis completed successfully");
        return true;
    } catch (error) {
        console.error("❌ SonarQube analysis failed:", error.message);
        return false;
    }
}

async function fetchSonarIssues() {
    console.log("🔍 Fetching SonarQube issues...");

    const axiosConfig = {
        auth: { username: SONAR_TOKEN, password: "" },
        headers: { "Content-Type": "application/json" },
    };

    try {
        // Fetch issues from SonarQube API
        const issuesResponse = await axios.get(`${SONAR_URL}/api/issues/search`, {
            ...axiosConfig,
            params: {
                componentKeys: PROJECT_KEY,
                resolved: "false",
                ps: 500,
                facets: "severities,types,rules",
            },
        });

        // Fetch project measures/metrics
        const measuresResponse = await axios.get(`${SONAR_URL}/api/measures/component`, {
            ...axiosConfig,
            params: {
                component: PROJECT_KEY,
                metricKeys: "bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,security_hotspots",
            },
        });

        // Fetch quality gate status
        const qualityGateResponse = await axios.get(`${SONAR_URL}/api/qualitygates/project_status`, {
            ...axiosConfig,
            params: {
                projectKey: PROJECT_KEY,
            },
        });

        const issues = issuesResponse.data.issues || [];
        const total = issuesResponse.data.total || 0;
        const measures = measuresResponse.data.component?.measures || [];
        const qualityGate = qualityGateResponse.data.projectStatus || {};

        console.log(`✅ Found ${issues.length} issues (total: ${total})`);
        console.log(`📊 Quality Gate Status: ${qualityGate.status || "Unknown"}`);

        return { issues, total, measures, qualityGate };
    } catch (error) {
        console.error("❌ Error fetching SonarQube issues:", error.message);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
        return null;
    }
}

function exportIssuesToFiles(sonarData) {
    if (!sonarData) {
        console.error("❌ No SonarQube data to export");
        return;
    }

    const { issues, total, measures, qualityGate } = sonarData;

    // Create reports directory
    const reportsDir = path.join(__dirname, "..", "sonar-reports");
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    // 1. Export raw JSON data
    const rawDataFile = path.join(reportsDir, "sonar-raw-data.json");
    fs.writeFileSync(rawDataFile, JSON.stringify(sonarData, null, 2));
    console.log(`📁 Raw data saved to: ${path.relative(process.cwd(), rawDataFile)}`);

    // 2. Export issues summary
    const summary = {
        totalIssues: total,
        severities: {},
        types: {},
        rules: {},
        qualityGate: qualityGate.status,
        exportDate: new Date().toISOString(),
    };

    issues.forEach((issue) => {
        summary.severities[issue.severity] = (summary.severities[issue.severity] || 0) + 1;
        summary.types[issue.type] = (summary.types[issue.type] || 0) + 1;
        summary.rules[issue.rule] = (summary.rules[issue.rule] || 0) + 1;
    });

    const summaryFile = path.join(reportsDir, "sonar-issues-summary.json");
    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    console.log(`📊 Summary saved to: ${path.relative(process.cwd(), summaryFile)}`);

    // 3. Export detailed issues by file
    const issuesByFile = {};
    issues.forEach((issue) => {
        const file = issue.component.split(":")[1] || "Unknown";
        if (!issuesByFile[file]) {
            issuesByFile[file] = [];
        }
        issuesByFile[file].push(issue);
    });

    const issuesByFileData = {
        totalIssues: total,
        qualityGate: qualityGate.status,
        exportDate: new Date().toISOString(),
        files: issuesByFile,
    };

    const issuesByFileFile = path.join(reportsDir, "sonar-issues-by-file.json");
    fs.writeFileSync(issuesByFileFile, JSON.stringify(issuesByFileData, null, 2));
    console.log(`📄 Issues by file saved to: ${path.relative(process.cwd(), issuesByFileFile)}`);

    // 4. Generate comprehensive markdown report
    let markdown = `# SonarQube Analysis Report\n\n`;
    markdown += `**Project:** ${PROJECT_KEY}\n`;
    markdown += `**Analysis Date:** ${new Date().toLocaleString()}\n`;
    markdown += `**Total Issues:** ${total}\n`;
    markdown += `**Quality Gate Status:** ${qualityGate.status || "Unknown"}\n\n`;

    // Add measures/metrics
    if (measures.length > 0) {
        markdown += `## Project Metrics\n\n`;
        measures.forEach((measure) => {
            const emoji =
                measure.metric === "bugs"
                    ? "🐛"
                    : measure.metric === "vulnerabilities"
                    ? "🔒"
                    : measure.metric === "code_smells"
                    ? "💡"
                    : measure.metric === "coverage"
                    ? "📊"
                    : "📈";
            markdown += `${emoji} **${measure.metric}:** ${measure.value || "N/A"}\n`;
        });
        markdown += `\n`;
    }

    // Severity breakdown
    markdown += `## Severity Breakdown\n\n`;
    Object.entries(summary.severities).forEach(([severity, count]) => {
        const emoji = severity === "BLOCKER" ? "🔴" : severity === "CRITICAL" ? "🟠" : severity === "MAJOR" ? "🟡" : "🔵";
        markdown += `${emoji} **${severity}:** ${count} issues\n`;
    });

    // Issues by file
    markdown += `\n## Issues by File\n\n`;
    Object.entries(issuesByFile).forEach(([file, fileIssues]) => {
        markdown += `### ${file}\n\n`;
        fileIssues.forEach((issue) => {
            const emoji =
                issue.severity === "BLOCKER" ? "🔴" : issue.severity === "CRITICAL" ? "🟠" : issue.severity === "MAJOR" ? "🟡" : "🔵";
            markdown += `${emoji} **Line ${issue.line}:** ${issue.message}\n`;
            markdown += `   - **Rule:** ${issue.rule}\n`;
            markdown += `   - **Effort:** ${issue.effort || "Unknown"}\n\n`;
        });
    });

    const markdownFile = path.join(reportsDir, "sonar-analysis-report.md");
    fs.writeFileSync(markdownFile, markdown);
    console.log(`📝 Markdown report saved to: ${path.relative(process.cwd(), markdownFile)}`);

    // 5. Export CSV for spreadsheet analysis
    let csv = "File,Line,Severity,Type,Rule,Message,Effort\n";
    issues.forEach((issue) => {
        const file = issue.component.split(":")[1] || "Unknown";
        const line = issue.line || "N/A";
        const severity = issue.severity || "N/A";
        const type = issue.type || "N/A";
        const rule = issue.rule || "N/A";
        const message = (issue.message || "N/A").replace(/"/g, '""');
        const effort = issue.effort || "N/A";

        csv += `"${file}","${line}","${severity}","${type}","${rule}","${message}","${effort}"\n`;
    });

    const csvFile = path.join(reportsDir, "sonar-issues.csv");
    fs.writeFileSync(csvFile, csv);
    console.log(`📊 CSV export saved to: ${path.relative(process.cwd(), csvFile)}`);
}

async function main() {
    console.log("🚀 Starting Code Analysis and SonarQube Integration");
    console.log("=".repeat(60));

    // Step 1: Run tests
    const testsPassed = await runTests();
    if (!testsPassed) {
        console.log("⚠️ Continuing despite test failures...");
    }

    // Step 2: Run linting
    const lintingPassed = await runLinting();
    if (!lintingPassed) {
        console.log("⚠️ Continuing despite linting issues...");
    }

    // Step 3: Run SonarQube analysis
    const sonarPassed = await runSonarAnalysis();
    if (!sonarPassed) {
        console.error("❌ SonarQube analysis failed. Cannot proceed with issue export.");
        process.exit(1);
    }

    // Step 4: Fetch and export issues
    console.log("\n📤 Exporting SonarQube issues...");
    const sonarData = await fetchSonarIssues();
    exportIssuesToFiles(sonarData);

    console.log("\n🎉 Analysis and export completed successfully!");
    console.log("📁 Check the 'sonar-reports' directory for all exported files:");
    console.log("   - sonar-raw-data.json (Complete raw data)");
    console.log("   - sonar-issues-summary.json (Summary statistics)");
    console.log("   - sonar-issues-by-file.json (Issues organized by file)");
    console.log("   - sonar-analysis-report.md (Human-readable report)");
    console.log("   - sonar-issues.csv (Spreadsheet-friendly format)");
}

// Run the main function
main().catch((error) => {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
});
