@echo off
echo ============================================
echo   OneAccounts Backend Server
echo   http://127.0.0.1:8000
echo   http://127.0.0.1:8000/api/docs
echo ============================================
echo.
call venv\Scripts\activate
python -m uvicorn app.main:app --reload
pause