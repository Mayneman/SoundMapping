cd "%~dp0"
call .\my_env\Scripts\activate.bat
set FLASK_APP=app.py
set FLASK_ENV=development
flask run
@REM pause