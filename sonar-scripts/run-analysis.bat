@echo off
echo ========================================
echo   SonarQube Analysis and Export Script
echo ========================================
echo.

echo Starting analysis...
node sonar-scripts/run-code-and-sonar.js

echo.
echo Analysis completed! Check the sonar-reports folder for results.
pause
