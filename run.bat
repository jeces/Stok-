@echo off
@chcp 65001 > nul
title Toss Invest Real-time Stock App Launcher

echo ========================================================
echo   [Toss Invest Viewer] Starting Application...
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 goto NO_NODE

if not exist node_modules goto INSTALL_DEPS
if not exist node_modules\.bin\next goto INSTALL_DEPS

goto START_SERVER

:INSTALL_DEPS
echo [INFO] Installing required npm packages... Please wait.
call npm install
if %errorlevel% neq 0 goto INSTALL_FAILED
goto START_SERVER

:START_SERVER
echo.
echo [INFO] Starting Next.js Web Server at http://localhost:3000 ...
echo Opening default web browser in 3 seconds...
echo.

start "" "http://localhost:3000"
call npm run dev
goto END

:NO_NODE
echo [ERROR] Node.js is not installed on this system.
echo Please download and install Node.js from https://nodejs.org
pause
exit /b 1

:INSTALL_FAILED
echo [ERROR] npm install failed. Please check your internet connection or Node.js installation.
pause
exit /b 1

:END
pause
