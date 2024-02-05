@echo off

:: Check for admin privileges
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Please run this script as an administrator.
) else (
    :: Check if the directory already exists
    if exist "C:\www\Poison Oak Media\feyBrewster" (
        cd "C:\www\Poison Oak Media\feyBrewster"
        git pull origin master
    )
)

pause :: Pause at the very end

