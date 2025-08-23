# PowerShell script to push to dopetechnepal repository
Write-Host "Setting up git push to dopetechnepal repository..."

# Disable pager
$env:GIT_PAGER = ""

# Add the new remote
Write-Host "Adding remote repository..."
git remote add dopetechnepal https://github.com/dopetechnp-dotcom/dopetechnepal.git

# Check if remote was added successfully
Write-Host "Checking remotes..."
git remote -v

# Push to the new repository
Write-Host "Pushing to dopetechnepal repository..."
git push dopetechnepal main

Write-Host "Push completed!"
