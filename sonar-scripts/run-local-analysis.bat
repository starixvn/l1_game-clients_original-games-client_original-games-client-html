@echo off
echo ========================================
echo   Local SonarQube Analysis Script
echo ========================================
echo.
echo This script will:
echo 1. Run tests and generate coverage
echo 2. Run linting
echo 3. Execute SonarQube analysis locally
echo 4. Generate local reports (NO SERVER PUSH)
echo.
echo ✅ Safe for CI/CD - no server conflicts
echo.
echo Starting local analysis...
echo.

cd /d "%~dp0"
node run-code-and-sonar-local.js

echo.
echo Local analysis completed! Check the output above for results.
pause
