@echo off
setlocal

:: Configuration
set REPO_URL=https://github.com/faizil09052007-art/BUG-REPORTER.git
set GITHUB_USER=faizil09052007-art

echo ========================================================
echo        PUSHING CODE TO GITHUB (FIXED SCRIPT)
echo ========================================================
echo.

:: 1. Set Identity (Fixes "Author identity unknown")
echo [1/6] Configuring Git identity...
git config --local user.name "%GITHUB_USER%"
git config --local user.email "%GITHUB_USER%@users.noreply.github.com"

:: 2. Initialize Git if not already
if not exist .git (
    echo [2/6] Initializing Git repository...
    git init
) else (
    echo [2/6] Git repository already initialized.
)

:: 3. Add ALL files (Crucial: adds the whole project)
echo [3/6] Adding all project files...
git add .

:: 4. Commit
echo [4/6] Committing changes...
git commit -m "Initial push of Full Stack Project"

:: 5. Branch
echo [5/6] Setting branch to main...
git branch -M main

:: 6. Remote
echo [6/6] Adding remote origin...
git remote remove origin >nul 2>&1
git remote add origin %REPO_URL%

echo.
echo ========================================================
echo READY TO PUSH TO: %REPO_URL%
echo ========================================================
echo.
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo SUCCESS: Code pushed to GitHub!
) else (
    echo FAILED: Something went wrong. Check the error message above.
)

echo.
pause
