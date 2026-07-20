@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Запуск приложения «to-DO»...
call npm.cmd run dev
if errorlevel 1 (
  echo.
  echo Не удалось запустить приложение. Проверьте сообщения выше.
  pause
)
