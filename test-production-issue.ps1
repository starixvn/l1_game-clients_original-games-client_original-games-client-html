# PowerShell script to simulate the production deployment issue

Write-Host "🚀 Testing Production Deployment Issue Simulation" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Yellow

# Test 1: Working routes (assets)
Write-Host "`n📁 Testing Asset Routes (should work):" -ForegroundColor Cyan
Write-Host "-------------------------------------"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/game-148/c.js" -Method GET
    Write-Host "✅ /game-148/c.js → $($response.StatusCode) (Static file served)" -ForegroundColor Green
}
catch {
    Write-Host "❌ /game-148/c.js → Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Failing routes (pages)
Write-Host "`n📄 Testing Page Routes (currently failing):" -ForegroundColor Cyan
Write-Host "-------------------------------------------"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/game-148" -Method GET
    Write-Host "✅ /game-148 → $($response.StatusCode) (Page served)" -ForegroundColor Green
}
catch {
    Write-Host "❌ /game-148 → $($_.Exception.Response.StatusCode) Not Found (This is the issue!)" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/game-148/timeout" -Method GET
    Write-Host "✅ /game-148/timeout → $($response.StatusCode) (Page served)" -ForegroundColor Green
}
catch {
    Write-Host "❌ /game-148/timeout → $($_.Exception.Response.StatusCode) Not Found (This is the issue!)" -ForegroundColor Red
}

# Test 3: Simulate what reverse proxy sends (stripped basePath)
Write-Host "`n🔄 Testing Reverse Proxy Simulation (stripped basePath):" -ForegroundColor Cyan
Write-Host "----------------------------------------------------------"

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/" -Method GET
    Write-Host "✅ / (stripped) → $($response.StatusCode) (Handled by basePath logic)" -ForegroundColor Green
}
catch {
    Write-Host "❌ / (stripped) → Failed: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/timeout" -Method GET
    Write-Host "✅ /timeout (stripped) → $($response.StatusCode) (Handled by basePath logic)" -ForegroundColor Green
}
catch {
    Write-Host "❌ /timeout (stripped) → Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📊 Summary:" -ForegroundColor Yellow
Write-Host "============"
Write-Host "• Asset routes work fine (Express static middleware)"
Write-Host "• Page routes fail with 404 (basePath transformation issue)"
Write-Host "• Reverse proxy simulation shows the root cause"
Write-Host "• The fix is in custom-server.js basePath handling logic"

Write-Host "`n🎯 Next Steps:" -ForegroundColor Green
Write-Host "=============="
Write-Host "1. Check the server logs for detailed transformation information"
Write-Host "2. Redeploy with the enhanced logging to see what's happening in production"
Write-Host "3. The logs will show exactly how URLs are being transformed"
