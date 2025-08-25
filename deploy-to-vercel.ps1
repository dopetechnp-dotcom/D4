# Vercel Deployment Fix Script
Write-Host "🚀 Deploying Vercel Fixes..." -ForegroundColor Green

# Check if git is available
try {
    git --version | Out-Null
    Write-Host "✅ Git is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not available. Please install Git first." -ForegroundColor Red
    exit 1
}

# Check current status
Write-Host "📊 Checking current git status..." -ForegroundColor Yellow
git status --porcelain

# Add all changes
Write-Host "📁 Adding all changes..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "🚀 Fix Vercel deployment - Remove auth, update config, optimize for Vercel"

# Push to main branch
Write-Host "🚀 Pushing to main branch..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Deployment initiated!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Go to Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Select your 'dopetechnp' project" -ForegroundColor White
Write-Host "3. Go to Settings -> Security" -ForegroundColor White
Write-Host "4. Disable Authentication/Password Protection" -ForegroundColor White
Write-Host "5. Verify environment variables are set" -ForegroundColor White
Write-Host "6. Wait for deployment to complete" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Your site will be available at: https://dopetechnp.vercel.app" -ForegroundColor Green
