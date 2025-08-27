@echo off
echo 🚀 Menjalankan Absensi Frontend...

:: pindah ke folder project (opsional, kalau dijalankan dari luar)
cd /d %~dp0

:: build React (opsional, kalau perlu build ulang setiap start)
echo 🔨 Build React app...
call npm run build

:: jalankan server.js dengan Node
echo 🌐 Menjalankan server di port 3000...
node server.js

pause
