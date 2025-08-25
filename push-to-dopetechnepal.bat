@echo off
echo Setting up git push to dopetechnepal repository...

REM Disable pager
set GIT_PAGER=

REM Add the new remote
echo Adding remote repository...
git remote add dopetechnepal https://github.com/dopetechnp-dotcom/dopetechnepal.git

REM Check if remote was added successfully
echo Checking remotes...
git remote -v

REM Push to the new repository
echo Pushing to dopetechnepal repository...
git push dopetechnepal main

echo Push completed!
pause
