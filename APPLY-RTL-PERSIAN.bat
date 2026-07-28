@echo off
chcp 65001 >nul
title Cursor RTL Persian - Apply Patch
echo.
echo ============================================
echo   Cursor RTL Persian - Apply Patch v1.2.8
echo ============================================
echo.
echo Cursor MUST be fully closed before continuing.
echo.
pause

set "SRC=%~dp0resources"
set "DST=C:\Program Files\cursor\resources\app\out\vs\workbench"

copy /Y "%SRC%\cursor-chat-rtl.css" "%DST%\cursor-chat-rtl.css"
if errorlevel 1 (
    echo FAILED - Right-click and "Run as administrator"
    pause
    exit /b 1
)

copy /Y "%SRC%\cursor-chat-rtl.js" "%DST%\cursor-chat-rtl.js"
if errorlevel 1 (
    echo FAILED copying JS.
    pause
    exit /b 1
)

echo SUCCESS! Now open Cursor and toggle RTL.
pause
