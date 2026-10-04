@echo off
TITLE 🌿 Anvitam Autopilot — Continuous Growth & Global Outreach Engine
COLOR 0A
CD /D "%~dp0"

echo ======================================================================
echo    ANVITAM ARCHITECTURE & ECOLOGICAL DESIGN STUDIO
echo    Autonomous Multi-Agent Engine & Global Client Acquisition
echo ======================================================================
echo.
echo [1/2] Verifying Python environment...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python was not found in PATH!
    echo Please install Python 3.10+ or add it to your system PATH.
    pause
    exit /b 1
)

echo [2/2] Checking credentials and syndication status...
python -m autopilot.scheduler --test-connections

echo.
echo ======================================================================
echo CHOOSE EXECUTION MODE:
echo ======================================================================
echo   [1] Continuous Growth Loop (Publishes Blogs & Socials Every 60m)
echo   [2] Single Daily Growth Cycle (Master Guide + 5 Social Posts)
echo   [3] Harvest & Stage Leads by Weekly Sector (Realtors / Cafes / Resorts / Architects)
echo   [4] Automated Live Outreach Dispatch (40-50/day via Resend · CCs Archana)
echo   [5] Full Autonomous Outreach (Auto-Harvest Active Cohort & Send Live)
echo ======================================================================
echo.

choice /C 12345 /N /T 10 /D 1 /M "Enter choice [1, 2, 3, 4, or 5] (Auto-starts [1] in 10s): "
set user_choice=%errorlevel%

if "%user_choice%"=="1" (
    echo.
    echo Launching Continuous 60-Minute Growth Engine...
    echo Safe Mode: Master guides saved as DRAFT in Firestore + published_records/
    echo Auto-Sync: Commits and pushes new records to GitHub automatically.
    echo.
    python -m autopilot.scheduler --interval 60
)

if "%user_choice%"=="2" (
    echo.
    echo Running Single Daily Cycle...
    python -m autopilot.engine --mode run-all
)

if "%user_choice%"=="3" (
    echo.
    echo Harvesting 95%% Global / 5%% India leads for active weekly sector cohort...
    python -m autopilot.leadgen.runner --mode all --dry-run
)

if "%user_choice%"=="4" (
    echo.
    echo Automatically dispatching staged outreach emails via Resend...
    echo Notification: CCs ar.archanagavas@gmail.com on every email.
    echo Audit Log: Writing detailed records to autopilot/leads/outreach_log.md
    echo.
    python -m autopilot.leadgen.runner --mode send --live
)

if "%user_choice%"=="5" (
    echo.
    echo Running Full Autonomous Outreach Pipeline (Harvest + Stage + Live Send)...
    python -m autopilot.leadgen.runner --mode all --live
)

echo.
echo [NOTICE] Operation complete.
pause
