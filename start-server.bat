@echo off

:: 检查是否安装了Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo 使用Python启动HTTP服务器...
    python -m http.server 8000
) else (
    echo 未找到Python，检查是否安装了Node.js...
    node --version >nul 2>&1
    if %errorlevel% == 0 (
        echo 使用Node.js启动HTTP服务器...
        npx http-server -p 8000
    ) else (
        echo 未找到Python或Node.js，请手动打开index.html文件
        pause
    )
)