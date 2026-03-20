@echo off
title GeleConnect Setup
color 0A

echo.
echo  ==========================================
echo    GeleConnect - One Click Setup
echo  ==========================================
echo.

REM Check correct folder
if not exist "package.json" (
    echo  ERROR: Run this from the GeleConnect folder
    echo  The folder must contain package.json
    pause
    exit /b 1
)

echo  [1/4] Installing packages...
echo  This downloads ~200MB. May take 3-5 mins on slow internet.
echo  If it fails, just run this file AGAIN - it will resume.
echo.

set PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

call npm install --prefer-offline 2>nul
if %errorlevel% neq 0 (
    echo.
    echo  First attempt failed. Retrying...
    call npm install --legacy-peer-deps
    if %errorlevel% neq 0 (
        echo.
        echo  Still failing. Try running SETUP_WINDOWS.bat again.
        echo  Or run: npm install --legacy-peer-deps
        pause
        exit /b 1
    )
)

echo.
echo  [2/4] Generating Prisma client...
call npx prisma generate
echo.

echo  [3/4] Creating database tables...
call npx prisma db push
if %errorlevel% neq 0 (
    echo.
    echo  ERROR: Database failed. Check:
    echo  1. PostgreSQL is running (open pgAdmin)
    echo  2. .env.local has correct password
    echo     DATABASE_URL should contain: postgres123
    pause
    exit /b 1
)

echo.
echo  [4/4] Loading demo data...
call npx tsx prisma/seed-demo.ts
echo.

echo  ==========================================
echo    Done! Starting GeleConnect...
echo  ==========================================
echo.
echo    Open: http://localhost:3000
echo.
echo    Accounts (password: demo1234!)
echo    - lamidecodes@gmail.com   = Admin
echo    - vendor@geleconnect.demo = Vendor Lagos
echo    - client@geleconnect.demo = Client
echo  ==========================================
echo.

call npm run dev
