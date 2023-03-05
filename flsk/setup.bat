@echo off
cd /d "%~dp0"
xcopy "C:\Program Files\ArcGIS\Pro\bin\Python\envs\arcgispro-py3\*" ".\my_env" /s /e /y
call ".\my_env\python.exe" -m pip install flask
call ".\my_env\python.exe" -m pip install pillow
pause