# SonarQube Scripts

This folder contains the essential SonarQube automation scripts for the original-games-client-html project.

## 📁 Scripts Overview

### 🔧 **Core Analysis Scripts**

#### `run-sonar.js`

-   **Purpose**: Basic SonarQube analysis execution
-   **Usage**: `node sonar-scripts/run-sonar.js`
-   **Description**: Runs SonarQube analysis with custom TypeScript rules

#### `run-code-and-sonar.js`

-   **Purpose**: Comprehensive analysis with tests, linting, and SonarQube
-   **Usage**: `node sonar-scripts/run-code-and-sonar.js`
-   **Description**:
    -   Runs tests and generates coverage
    -   Runs linting
    -   Executes SonarQube analysis
    -   Exports issues to multiple formats in `../sonar-reports/`

### 🔄 **Automated Fix Scripts**

#### `fix-and-verify.js`

-   **Purpose**: Automated fix and verify until Quality Gate passes
-   **Usage**: `node sonar-scripts/fix-and-verify.js`
-   **Description**:
    -   Fixes unit test issues
    -   Fixes SonarQube issues (unused imports)
    -   Runs analysis until Quality Gate passes
    -   Maximum 5 attempts

### 📊 **Export Scripts**

#### `export-sonar-issues.js`

-   **Purpose**: Export SonarQube issues and dashboard data
-   **Usage**: `node sonar-scripts/export-sonar-issues.js`
-   **Description**:
    -   Fetches issues, measures, and quality gate status
    -   Exports to JSON, Markdown, and CSV formats
    -   Saves to `../sonar-reports/` directory

### 🚀 **Batch Files (Windows)**

#### `fix-and-verify.bat`

-   **Purpose**: Easy execution of automated fix and verify
-   **Usage**: Double-click or `sonar-scripts/fix-and-verify.bat`
-   **Description**: Runs `fix-and-verify.js` with user-friendly interface

## 🔧 **Configuration**

### Environment Variables

All scripts support these environment variables:

-   `SONAR_URL` - SonarQube server URL (default: https://sonarqube.lumigame.com)
-   `SONAR_PROJECT_KEY` - Project key (default: sedie-multiplayer-client)
-   `SONAR_TOKEN` - API token (default: sqa_1f724aecdc0b76fa05c71e38bf4bcb5d6dadaa6b)

### Custom Rules

-   Uses custom TypeScript rules from `typescript-rules.xml` (in this folder)
-   Rules are applied during SonarQube analysis

## 📁 **Output Files**

All scripts generate output in the `../sonar-reports/` directory:

-   `sonar-raw-data.json` - Complete raw API data
-   `sonar-issues-summary.json` - Summary statistics
-   `sonar-issues-by-file.json` - Issues organized by file
-   `sonar-analysis-report.md` - Human-readable report
-   `sonar-issues.csv` - Spreadsheet-friendly format

## 🚀 **Quick Start**

### Basic Analysis

```bash
node sonar-scripts/run-code-and-sonar.js
```

### Automated Fix and Verify

```bash
node sonar-scripts/fix-and-verify.js
```

### Export Issues Only

```bash
node sonar-scripts/export-sonar-issues.js
```

### Windows Users

```bash
# Double-click or run:
sonar-scripts/fix-and-verify.bat
```

## 🔄 **Workflow**

1. **Development**: Use `run-code-and-sonar.js` for regular analysis
2. **Issue Resolution**: Use `fix-and-verify.js` for automated fixes
3. **Reporting**: Use `export-sonar-issues.js` for detailed reports
4. **Monitoring**: Check `../sonar-reports/` for all outputs

## 📝 **Notes**

-   All scripts run from the project root directory
-   Scripts automatically handle authentication with SonarQube API
-   Failed tests or linting issues don't stop the process
-   Quality Gate status is checked after each analysis
-   Maximum 5 attempts for automated fixes to prevent infinite loops
-   Custom TypeScript rules are loaded from `typescript-rules.xml` in this folder
