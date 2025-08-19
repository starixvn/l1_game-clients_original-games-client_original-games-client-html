@echo off
echo ========================================
echo   SonarQube Analysis Launcher
echo ========================================
echo.
echo Choose an option:
echo 1. Run comprehensive analysis (tests + linting + SonarQube + export) - PUSHES TO SERVER
echo 2. Run local analysis (tests + linting + SonarQube) - NO SERVER PUSH
echo 3. Run changed files analysis (fast, only recent changes) - NO SERVER PUSH
echo 4. Run automated fix and verify (until Quality Gate passes)
echo 5. Export SonarQube issues only
echo 6. Run basic SonarQube analysis only
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    echo.
    echo Running comprehensive analysis (PUSHES TO SERVER)...
    node sonar-scripts/run-code-and-sonar.js
) else if "%choice%"=="2" (
    echo.
    echo Running local analysis (NO SERVER PUSH)...
    node sonar-scripts/run-code-and-sonar-local.js
) else if "%choice%"=="3" (
    echo.
    echo Running changed files analysis (FAST, NO SERVER PUSH)...
    node sonar-scripts/run-code-and-sonar-changed.js
) else if "%choice%"=="4" (
    echo.
    echo Running automated fix and verify...
    node sonar-scripts/fix-and-verify.js
) else if "%choice%"=="5" (
    echo.
    echo Exporting SonarQube issues...
    node sonar-scripts/export-sonar-issues.js
) else if "%choice%"=="6" (
    echo.
    echo Running basic SonarQube analysis...
    node sonar-scripts/run-sonar.js
) else (
    echo Invalid choice. Please run the script again.
)

echo.
echo Analysis completed! Check the sonar-reports folder for results.
pause
