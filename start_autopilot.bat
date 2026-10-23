@echo off
TITLE 🌿 Anvitam Autopilot — Master Dual-Engine Launcher
COLOR 0A
CD /D "%~dp0"

echo ======================================================================
echo    ANVITAM ARCHITECTURE + ECOLOGICAL DESIGN STUDIO
echo    Autonomous Multi-Agent Engine + Global Client Acquisition
echo ======================================================================
echo.
echo [1/3] Verifying Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python was not found in PATH!
    echo Please install Python 3.10+ or add it to your system PATH.
    pause
    exit /b 1
)

echo [2/3] Checking and auto-installing Python dependencies...
python -c "import dotenv, requests, bs4, atproto, mastodon, tweepy, firebase_admin" >nul 2>&1
if %errorlevel% neq 0 (
    echo [NOTICE] Installing missing packages from requirements-autopilot.txt...
    python -m pip install -r requirements-autopilot.txt
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install requirements!
        pause
        exit /b 1
    )
) else (
    echo [OK] All core dependencies verified.
)

echo.
echo [3/4] Auto-Housekeeping: Purging published records and logs older than 24h...
python -m autopilot.cleanup --hours 24

echo.
echo [4/4] Checking credentials and syndication status...
python -m autopilot.scheduler --test-connections

echo.
echo ======================================================================
echo LAUNCHING BOTH AUTONOMOUS ENGINES IN INDEPENDENT LIVE TERMINALS:
echo ======================================================================
echo.
echo   [Window 1] Content + Social Syndication Engine (Paced 3-Hour Cadence, Max 2 Blogs/Day)
echo              - Live SERP scraper & competitor H1/H2 research
echo              - Automated Gemini / FLUX.1 architectural image generation
echo              - Publishes architectural master guides + 5 tailored posts
echo              - Syndicates to Bluesky, Mastodon, Threads, Buffer, Twitter, Medium
echo              - Updates link registry and auto-syncs to GitHub
echo.
echo   [Window 2] Global Lead Generation + Live Outreach Engine (1 Email Every 5 Mins)
echo              - Dispatches to 100+ verified leads (Restaurants, Landowners/NRIs, Retreats, Realtors, Architects)
echo              - Exact 5-minute spacing between sends for pristine inbox reputation
echo              - Dispatches live via Resend API (CCs ar.archanagavas@gmail.com on every send)
echo              - Automatically emails an alert to ar.archanagavas@gmail.com when queue completes
echo.
echo ======================================================================
echo.

:: Launch Window 1 (Content & Socials Loop)
echo Starting Window 1: Content + Social Syndication Loop...
start "🌿 Anvitam [Window 1] - Content + Social Syndication Engine" cmd /k "cd /d "%~dp0" && color 0B && python -m autopilot.scheduler --interval 180 --max-blogs 2"

:: Launch Window 2 (Lead Gen & Outreach Loop)
echo Starting Window 2: Global Lead Gen + Live Outreach Engine...
start "🌿 Anvitam [Window 2] - Global Lead Gen + Live Outreach Engine" cmd /k "cd /d "%~dp0" && color 0E && python -m autopilot.leadgen.runner --mode all --live --loop --interval 10"

echo.
echo ======================================================================
echo [SUCCESS] Both autonomous engines are now executing live side-by-side!
echo Keep both terminal windows open to allow continuous background runs.
echo Press any key to close this launcher window (worker engines remain running).
echo ======================================================================
echo.
pause
