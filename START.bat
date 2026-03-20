@echo off
title GeleConnect
color 0A

if not exist "package.json" (
    echo ERROR: Run this from the geleconnect folder ^(where package.json is^)
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo node_modules not found - running setup first...
    call SETUP_WINDOWS.bat
    exit /b
)

echo.
echo  ================================
echo    Starting GeleConnect...
echo    http://localhost:3000
echo.
echo    Press Ctrl+C to stop
echo  ================================
echo.
call npm run dev
