# to-DO

Отдельное Windows-приложение для личных целей, задач, планов и заметок. Данные хранятся локально в SQLite.

## Запуск

Самый простой способ в Windows — дважды щёлкнуть `start-dev.cmd`.

Или запустить из PowerShell без изменения Execution Policy:

```powershell
cd "C:\Users\kill_ly\Documents\софт\compass"
npm.cmd run dev
```

## Установщик Windows

Запустите `build-installer.cmd` или выполните `npm.cmd run dist`.
Готовый `.exe` появится в `release`. Установщик создаёт ярлык «to-DO» на рабочем столе и в меню «Пуск».
