const axios = require("axios");
const fs = require("fs");
const path = require("path");

// SonarQube configuration
const SONAR_URL = "https://sonarqube.lumigame.com";
const PROJECT_KEY = "sedie-multiplayer-client";
const SONAR_TOKEN = "sqa_1f724aecdc0b76fa05c71e38bf4bcb5d6dadaa6b";

async function exportSonarIssues() {
    try {
        console.log("🔍 Fetching SonarQube dashboard data...");

        // Use Basic Auth with token as username
        const axiosConfig = {
            auth: { username: SONAR_TOKEN, password: "" },
            headers: { "Content-Type": "application/json" },
        };

        // Fetch issues from SonarQube API
        const issuesResponse = await axios.get(`${SONAR_URL}/api/issues/search`, {
            ...axiosConfig,
            params: {
                componentKeys: PROJECT_KEY,
                resolved: "false", // Better than statuses filter
                ps: 500, // Get up to 500 issues
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

        // Create reports directory if it doesn't exist
        const reportsDir = path.join(__dirname, "..", "sonar-reports");
        if (!fs.existsSync(reportsDir)) {
            fs.mkdirSync(reportsDir, { recursive: true });
        }

        // Save comprehensive dashboard data
        const dashboardData = {
            projectKey: PROJECT_KEY,
            projectName: "SeDie Multiplayer Client",
            exportDate: new Date().toISOString(),
            totalIssues: total,
            issues: issues,
            measures: measures,
            qualityGate: qualityGate,
        };

        const dashboardFile = path.join(reportsDir, "sonar-dashboard-export.json");
        fs.writeFileSync(dashboardFile, JSON.stringify(dashboardData, null, 2));
        console.log(`📁 Dashboard data saved to: ${dashboardFile}`);

        // Generate summary
        const summary = {
            totalIssues: total,
            severities: {},
            types: {},
            rules: {},
        };

        issues.forEach((issue) => {
            // Count severities
            summary.severities[issue.severity] = (summary.severities[issue.severity] || 0) + 1;

            // Count types
            summary.types[issue.type] = (summary.types[issue.type] || 0) + 1;

            // Count rules
            summary.rules[issue.rule] = (summary.rules[issue.rule] || 0) + 1;
        });

        const summaryFile = path.join(reportsDir, "sonar-issues-summary.json");
        fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
        console.log(`📊 Summary saved to: ${summaryFile}`);

        // Generate comprehensive markdown report
        let markdown = `# SonarQube Dashboard Report\n\n`;
        markdown += `**Project:** ${PROJECT_KEY}\n`;
        markdown += `**Export Date:** ${new Date().toLocaleString()}\n`;
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
        const issuesByFile = {};
        issues.forEach((issue) => {
            const file = issue.component.split(":")[1] || "Unknown";
            if (!issuesByFile[file]) {
                issuesByFile[file] = [];
            }
            issuesByFile[file].push(issue);
        });

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

        const markdownFile = path.join(reportsDir, "sonar-issues-report.md");
        fs.writeFileSync(markdownFile, markdown);
        console.log(`📝 Report saved to: ${markdownFile}`);

        console.log("\n🎉 SonarQube issues export completed successfully!");
        console.log(`📁 Check the 'sonar-reports' directory for all files.`);
    } catch (error) {
        console.error("❌ Error exporting SonarQube issues:", error.message);
        if (error.response) {
            console.error("Response status:", error.response.status);
            console.error("Response data:", error.response.data);
        }
    }
}

// Run the export
exportSonarIssues();
