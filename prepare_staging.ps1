$staging = "deploy_staging"
$publicHtml = "$staging/public_html"
$apiApp = "$staging/api_app"

# 1. Create structure
if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
New-Item -ItemType Directory -Path $staging
New-Item -ItemType Directory -Path $publicHtml
New-Item -ItemType Directory -Path $apiApp

# 2. Copy Frontend
Write-Host "Copying frontend assets..."
Copy-Item -Path "dist/*" -Destination $publicHtml -Recurse
Copy-Item -Path ".htaccess_frontend" -Destination "$publicHtml/.htaccess"

# 3. Copy Backend
Write-Host "Copying backend (excluding dev junk)..."
Copy-Item -Path "backend/*" -Destination $apiApp -Recurse -Exclude @(".git", ".github", "node_modules", "vendor", "storage/logs/*")

# 4. Copy Instructions
Copy-Item -Path "DEPLOYMENT_INSTRUCTIONS.txt" -Destination "$staging/DEPLOYMENT_INSTRUCTIONS.txt"

# 5. Ensure LF line endings for Linux compatibility
Write-Host "Converting line endings to LF..."
$textExtensions = @(".php", ".env", ".htaccess", ".sql", ".js", ".css", ".html", ".txt", ".json")
Get-ChildItem -Path $staging -Recurse -File | ForEach-Object {
    if ($textExtensions -contains $_.Extension -or $_.Name -eq ".env") {
        $content = [IO.File]::ReadAllText($_.FullName)
        if ($content -match "`r`n") {
            $content = $content -replace "`r`n", "`n"
            [IO.File]::WriteAllText($_.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
        }
    }
}

Write-Host "Staging complete."
