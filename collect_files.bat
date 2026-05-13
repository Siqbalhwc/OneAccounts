@echo off
setlocal enabledelayedexpansion

set "OUTPUT=critical_files_for_review.txt"
set "SEPARATOR============================================="

:: Delete old output file if exists
if exist "%OUTPUT%" del "%OUTPUT%"

:: List of files to collect (relative to script location)
set FILES[0]=backend\app\core\tenant_middleware.py
set FILES[1]=backend\app\core\auth.py
set FILES[2]=backend\app\core\jwt.py
set FILES[3]=backend\app\core\permissions.py
set FILES[4]=backend\app\core\dependencies.py
set FILES[5]=backend\app\core\config.py
set FILES[6]=backend\app\api\v1\router.py
set FILES[7]=backend\app\repositories\base.py
set FILES[8]=backend\app\services\tenant_service.py
set FILES[9]=backend\app\services\accounting\journal_service.py
set FILES[10]=backend\app\services\accounting\ledger_service.py
set FILES[11]=frontend\middleware.ts
set FILES[12]=frontend\app\dashboard\layout.tsx
set FILES[13]=frontend\app\dashboard\sidebar-client.tsx
set FILES[14]=frontend\app\login\page.tsx
set FILES[15]=frontend\app\api\invoices\route.ts

for /L %%i in (0,1,15) do (
    set "FP=!FILES[%%i]!"
    if defined FP (
        echo %SEPARATOR%>> "%OUTPUT%"
        echo FILE: !FP!>> "%OUTPUT%"
        echo %SEPARATOR%>> "%OUTPUT%"
        
        if exist "!FP!" (
            for %%A in ("!FP!") do set "FSIZE=%%~zA"
            if !FSIZE! equ 0 (
                echo [File is empty]>> "%OUTPUT%"
            ) else (
                type "!FP!">> "%OUTPUT%" 2>nul
                :: Ensure a newline after content (type doesn't always add one)
                echo.>> "%OUTPUT%"
            )
        ) else (
            echo *** FILE NOT FOUND ***>> "%OUTPUT%"
        )
        echo.>> "%OUTPUT%"   :: Blank line for separation
    )
)

echo Collection complete. Output written to %OUTPUT%
pause