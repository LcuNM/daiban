@echo off
chcp 65001 >nul
rem 清除 DSH 注入的 ELECTRON_RUN_AS_NODE，否则 electron 会以 node 模式跑一下就退出
set ELECTRON_RUN_AS_NODE=
set "APP=%~dp0"
if "%APP:~-1%"=="\" set "APP=%APP:~0,-1%"
start "" "C:\Users\elysia\.dsh\dsh-orb\electron-runtime\electron.exe" "%APP%"
