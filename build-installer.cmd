@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Создание установщика «to-DO» для Windows...
call npm.cmd run dist
if errorlevel 1 (
  echo.
  echo Сборка завершилась с ошибкой. Проверьте сообщения выше.
  pause
  exit /b 1
)
echo.
echo Установщик готов в папке release.
explorer "%~dp0release"
pause
