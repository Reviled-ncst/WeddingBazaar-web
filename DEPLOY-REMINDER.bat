@echo off
color 0C
echo.
echo    =========================================
echo    =                                       =
echo    =     DID YOU DEPLOY YOUR CHANGES?      =
echo    =                                       =
echo    =========================================
echo.
echo.
color 0E
echo     If NO, run this command now:
echo.
color 0F
echo     .\deploy-complete.ps1
echo.
echo.
color 0A
echo     Then verify:
echo.
color 0F
echo     .\check-deployment-status.ps1
echo.
echo.
color 0C
echo    =========================================
echo    =                                       =
echo    =    CHANGES ARE NOT LIVE UNTIL         =
echo    =         YOU DEPLOY THEM!              =
echo    =                                       =
echo    =========================================
echo.
color 0F
pause
