@echo off

set BASE_DIR=C:\www\Poison Oak Media

:: Enhanced Node.js and GitHub checks:
where node 2>nul >nul && echo Node.js found || (echo Node.js not found. Please download and install it from https://nodejs.org/ && goto :PAUSE_HERE)
where git 2>nul >nul && echo GitHub found || (echo GitHub not found. Please install it from https://desktop.github.com/ or using a package manager. && goto :PAUSE_HERE)

:: Admin check with clear error message:
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Please run this script as an administrator.
  goto :PAUSE_HERE
)

:: Directory existence check and creation:
if exist "%BASE_DIR%\feyBrewster" (
  echo Directory "%BASE_DIR%\feyBrewster" already exists.
) else (
  if not exist "%BASE_DIR%" (
    mkdir "%BASE_DIR%" :: Create the base directory if it doesn't exist
    echo Base directory "%BASE_DIR%" created successfully.
  )
  cd "%BASE_DIR%"
  git clone https://github.com/bgwest/feyBrewster.git
  cd feyBrewster
  where webpack >nul 2>&1
  if %errorlevel% neq 0 (
    echo Webpack is not installed locally. Installing...
    npm install webpack webpack-cli
  )
)
echo Finished successfully.

:PAUSE_HERE
pause