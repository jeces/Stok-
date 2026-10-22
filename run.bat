@echo off
chcp 65001 >nul
title 토스증권 스타일 실시간 주식/환율 애플리케이션 실행기

echo ========================================================
echo   [Toss Invest Viewer] 실시간 주식 및 환율 앱 시작 중...
echo ========================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [오류] Node.js가 설치되어 있지 않습니다.
    echo https://nodejs.org 에서 Node.js를 설치한 후 다시 실행해 주세요.
    pause
    exit /b 1
)

REM Check if node_modules exists, if not run npm install
if not exist "node_modules\" (
    echo [안내] 의존성 패키지가 없습니다. 패키지를 설치합니다...
    call npm install
    if %errorlevel% neq 0 (
        echo [오류] 패키지 설치 실패.
        pause
        exit /b 1
    )
)

echo.
echo [안내] 웹 애플리케이션 서버를 시작합니다... (http://localhost:3000)
echo 브라우저가 자동으로 열립니다. 종료하려면 이 창에서 Ctrl+C를 누르세요.
echo.

REM Open browser after 3 seconds in background
start "" "http://localhost:3000"

REM Run dev server
call npm run dev

pause
