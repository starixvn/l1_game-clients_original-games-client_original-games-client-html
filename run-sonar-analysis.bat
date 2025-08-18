@echo off
echo ========================================
echo   SonarQube Analysis Launcher
echo ========================================
echo.
echo Choose an option:
echo 1. Run comprehensive analysis (tests + linting + SonarQube + export)
echo 2. Run automated fix and verify (until Quality Gate passes)
echo 3. Export SonarQube issues only
echo 4. Run basic SonarQube analysis only
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" (
    echo.
    echo Running comprehensive analysis...
    node sonar-scripts/run-code-and-sonar.js
) else if "%choice%"=="2" (
    echo.
    echo Running automated fix and verify...
    node sonar-scripts/fix-and-verify.js
) else if "%choice%"=="3" (
    echo.
    echo Exporting SonarQube issues...
    node sonar-scripts/export-sonar-issues.js
) else if "%choice%"=="4" (
    echo.
    echo Running basic SonarQube analysis...
    node sonar-scripts/run-sonar.js
) else (
    echo Invalid choice. Please run the script again.
)

echo.
echo Analysis completed! Check the sonar-reports folder for results.
pause
