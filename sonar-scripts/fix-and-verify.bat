@echo off
echo ========================================
echo   Automated Fix and Verify Script
echo ========================================
echo.
echo This script will:
echo 1. Fix unit test issues
echo 2. Fix SonarQube issues (unused imports)
echo 3. Run analysis until Quality Gate passes
echo 4. Maximum 5 attempts
echo.
echo Starting automated fix and verify process...
echo.

cd /d "%~dp0"
node fix-and-verify.js

echo.
echo Process completed! Check the output above for results.
pause
