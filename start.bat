@echo off
setlocal

:: 1. Navigate to Project Root Directory
cd /d "%~dp0"

:: 2. Set Console Title
title StreakForge Pro - LeetCode Studio

echo ============================================================
echo   StreakForge Pro - LeetCode to LinkedIn Studio Launcher
echo ============================================================
echo.

:: 3. Verify Node.js Installation
where node >nul 2>&1
if not errorlevel 1 goto node_ready

if exist "%ProgramFiles%\nodejs\node.exe" set "PATH=%PATH%;%ProgramFiles%\nodejs"
if exist "%LOCALAPPDATA%\Programs\node\node.exe" set "PATH=%PATH%;%LOCALAPPDATA%\Programs\node"

where node >nul 2>&1
if not errorlevel 1 goto node_ready

echo.
echo ============================================================
echo [ERROR] Node.js is not found in your system PATH!
echo ============================================================
echo.
echo Node.js is required to run this application.
echo Please download and install it from: https://nodejs.org/
echo Once installed, double-click start.bat again.
echo.
pause
exit /b 1

:node_ready

:: 4. Verify Backend Entry Script Exists
if not exist "server.js" (
    echo.
    echo ============================================================
    echo [ERROR] Startup file 'server.js' was not found!
    echo ============================================================
    echo Make sure start.bat is located in the project root directory.
    echo Current folder: %CD%
    echo.
    pause
    exit /b 1
)

:: 5. Verify and Install Dependencies if Missing
if not exist "node_modules\" (
    echo [INFO] Dependencies not found. Installing packages via 'npm install'...
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install dependencies via 'npm install'.
        echo Please check your internet connection and try again.
        echo.
        pause
        exit /b 1
    )
)

:: 6. Verify and Build Frontend Bundle if Missing
if not exist "public\app.js" (
    echo [INFO] Frontend bundle missing. Building with esbuild...
    call npm run build
)

:: 7. Check for .env Configuration File
if not exist ".env" (
    echo [WARNING] No .env configuration file detected!
    if exist ".env.example" (
        echo [INFO] Creating .env from .env.example template...
        copy ".env.example" ".env" >nul
        echo [IMPORTANT] Please add your GEMINI_API_KEY to the .env file.
        echo.
    )
)

:: 8. Read Configured PORT Dynamically from .env (Default: 3000)
set "PORT=3000"
if exist ".env" (
    for /f "tokens=1,2 delims==" %%A in ('type ".env" ^| findstr /i "^PORT="') do (
        set "PORT=%%B"
    )
)

:: 9. Check if Server is Already Running on Port %PORT%
netstat -ano | findstr /R /C:":%PORT% .*LISTENING" >nul 2>&1
if not errorlevel 1 (
    echo.
    echo ============================================================
    echo  StreakForge Pro is ALREADY running on port %PORT%!
    echo ============================================================
    echo.
    echo [INFO] Opening http://localhost:%PORT% in your default browser...
    start "" "http://localhost:%PORT%"
    echo.
    echo The server is already active in an existing process.
    echo You can view the application in your browser.
    echo.
    echo Press any key to close this launcher window...
    pause >nul
    exit /b 0
)

:: 10. Start Server & Open Default Browser
echo.
echo ============================================================
echo  Starting StreakForge Pro on http://localhost:%PORT%
echo ============================================================
echo.
echo [INFO] Opening default browser in 2 seconds...
echo [INFO] To stop the server, press Ctrl+C in this window.
echo.

start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:%PORT%'"

node server.js

echo.
echo ============================================================
echo [NOTICE] Application process has stopped.
echo ============================================================
echo.
pause
