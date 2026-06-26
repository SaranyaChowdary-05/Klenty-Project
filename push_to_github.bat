@echo off
echo ===================================================
echo 🚀 SprintHub Git Push Automation Script
echo ===================================================
echo.

cd /d "c:\Users\chand\OneDrive\Desktop\Klenty Project"

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Error: Git is not installed on this system or not in PATH.
    echo Please install Git from https://git-scm.com/ and try again.
    pause
    exit /b
)

:: Initialize Git if .git folder doesn't exist
if not exist .git (
    echo 🔄 Initializing git repository...
    git init
)

:: Set remote origin URL
echo 🔄 Setting up GitHub remote origin...
git remote remove origin >nul 2>nul
git remote add origin https://github.com/SaranyaChowdary-05/Klenty-Project.git

:: Add files
echo 🔄 Staging project files...
git add .

:: Commit
echo 🔄 Committing files...
git commit -m "Initial commit: SprintHub Full-Stack Project Management Portal"

:: Rename branch to main
git branch -M main

:: Push
echo 🚀 Pushing code to GitHub (main branch)...
echo (If prompted, please complete the GitHub sign-in in your browser window)
echo.
git push -u origin main

if %errorlevel% eq 0 (
    echo.
    echo ✅ Project successfully pushed to GitHub!
) else (
    echo.
    echo ❌ Push failed. Please check your internet connection or GitHub permissions.
)

pause
