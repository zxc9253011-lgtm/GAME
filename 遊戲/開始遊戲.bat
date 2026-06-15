@echo off
chcp 65001 >nul
title CyberPose 啟動器
echo ==========================================
echo       雙人體感姿勢挑戰賽 (CyberPose)
echo ==========================================
echo.
echo 正在啟動本地遊戲伺服器...
echo [說明] 因為瀏覽器的安全限制，直接點擊 HTML 會導致 AI 模型無法下載 (Failed to fetch)。
echo        所以我們需要透過這個小程式來啟動本地伺服器。
echo.

:: 嘗試使用 Python
python --version >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    echo [成功] 找到 Python 環境，伺服器啟動於 Port 8080...
    start http://localhost:8080
    python -m http.server 8080
    exit
)

:: 嘗試使用 Node.js / npx
npx --version >nul 2>&1
IF %ERRORLEVEL% EQU 0 (
    echo [成功] 找到 Node.js 環境，伺服器啟動於 Port 8080...
    start http://localhost:8080
    npx http-server -p 8080 -c-1
    exit
)

echo ==========================================
echo [錯誤] 啟動失敗！
echo 您的電腦似乎沒有安裝 Python 或 Node.js。
echo.
echo 替代方案：
echo 1. 開啟 VS Code。
echo 2. 將這個「遊戲」資料夾拖曳進 VS Code。
echo 3. 安裝並點擊右下角的 "Go Live" (Live Server 擴充功能)。
echo ==========================================
pause
