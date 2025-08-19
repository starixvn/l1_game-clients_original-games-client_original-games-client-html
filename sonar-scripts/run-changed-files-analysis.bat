@echo off
echo ========================================
echo   Changed Files Analysis Script
echo ========================================
echo.
echo This script will:
echo 1. Detect changed files using git
echo 2. Run tests only on changed files
echo 3. Run linting only on changed files
echo 4. Execute SonarQube analysis on changed files
echo 5. Generate changed files reports
echo.
echo ⚡ Much faster - analyzes only recent changes
echo ✅ Safe for CI/CD - no server conflicts
echo.
echo Starting changed files analysis...
echo.

cd /d "%~dp0"
node run-code-and-sonar-changed.js

echo.
echo Changed files analysis completed! Check the output above for results.
pause
