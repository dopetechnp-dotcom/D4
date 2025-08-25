# 🚀 Deploy to Vercel with Email Configuration Script
# This script helps you deploy your DopeTech Nepal project to Vercel with email functionality

Write-Host "🎮 DopeTech Nepal - Vercel Deployment with Email Setup" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if Vercel CLI is installed
Write-Host "`n📋 Checking Vercel CLI installation..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI found: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Installing..." -ForegroundColor Red
    npm install -g vercel
}

# Check if user is logged in to Vercel
Write-Host "`n🔐 Checking Vercel login status..." -ForegroundColor Yellow
try {
    $userInfo = vercel whoami
    Write-Host "✅ Logged in as: $userInfo" -ForegroundColor Green
} catch {
    Write-Host "❌ Not logged in to Vercel. Please login..." -ForegroundColor Red
    vercel login
    Write-Host "`n✅ Login completed!" -ForegroundColor Green
}

# Display environment variables that need to be set
Write-Host "`n📧 Required Environment Variables for Email:" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "RESEND_API_KEY=re_6CyBkNKP_Ekzfh7Unk9GLM7n1WMFbwdoL" -ForegroundColor Cyan
Write-Host "ADMIN_EMAIL=dopetechnp@gmail.com" -ForegroundColor Cyan
Write-Host "`nOptional (for backup):" -ForegroundColor Gray
Write-Host "GMAIL_USER=your_gmail@gmail.com" -ForegroundColor Gray
Write-Host "GMAIL_APP_PASSWORD=your_gmail_app_password" -ForegroundColor Gray

# Instructions for setting environment variables
Write-Host "`n📝 To set environment variables in Vercel:" -ForegroundColor Yellow
Write-Host "1. Go to https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Select your project" -ForegroundColor White
Write-Host "3. Go to Settings > Environment Variables" -ForegroundColor White
Write-Host "4. Add the variables above" -ForegroundColor White
Write-Host "5. Redeploy the project" -ForegroundColor White

# Ask user if they want to deploy now
Write-Host "`n🚀 Ready to deploy?" -ForegroundColor Yellow
$deploy = Read-Host "Enter 'y' to deploy now, or 'n' to set environment variables first"

if ($deploy -eq 'y' -or $deploy -eq 'Y') {
    Write-Host "`n🚀 Deploying to Vercel..." -ForegroundColor Green
    Write-Host "This will open the Vercel deployment interface..." -ForegroundColor Yellow
    
    # Deploy to Vercel
    vercel --prod
    
    Write-Host "`n✅ Deployment completed!" -ForegroundColor Green
    Write-Host "`n📧 To test email functionality:" -ForegroundColor Yellow
    Write-Host "1. Visit your deployed site" -ForegroundColor White
    Write-Host "2. Place a test order" -ForegroundColor White
    Write-Host "3. Check dopetechnp@gmail.com for admin notification" -ForegroundColor White
    Write-Host "4. Check customer email for confirmation" -ForegroundColor White
} else {
    Write-Host "`n📝 Please set the environment variables first, then run this script again." -ForegroundColor Yellow
    Write-Host "Or run: vercel --prod" -ForegroundColor Cyan
}

Write-Host "`n🎯 Email Service Features:" -ForegroundColor Green
Write-Host "✅ Admin notifications for all orders" -ForegroundColor White
Write-Host "✅ Customer order confirmations" -ForegroundColor White
Write-Host "✅ Receipt attachments" -ForegroundColor White
Write-Host "✅ Order details in email body" -ForegroundColor White
Write-Host "✅ Error handling and logging" -ForegroundColor White

Write-Host "`n📚 For more help, see: EMAIL_FIX_FOR_VERCEL.md" -ForegroundColor Cyan
