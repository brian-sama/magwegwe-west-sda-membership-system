$staging = "deploy_staging"

# 1. Create structure
if (Test-Path $staging) { Remove-Item -Recurse -Force $staging }
New-Item -ItemType Directory -Path $staging

# 2. Copy Frontend (Directly to root)
Write-Host "Copying frontend assets..."
Copy-Item -Path "dist/*" -Destination $staging -Recurse
Copy-Item -Path ".htaccess_frontend" -Destination "$staging/.htaccess"

# 3. Copy Plain PHP API to /api
Write-Host "Copying plain PHP API..."
$stagingApi = "$staging/api"
New-Item -ItemType Directory -Path $stagingApi
Copy-Item -Path "api/*" -Destination $stagingApi -Recurse

# 4. Copy Instructions
Copy-Item -Path "DEPLOYMENT_INSTRUCTIONS.txt" -Destination "$staging/DEPLOYMENT_INSTRUCTIONS.txt"

# 5. Ensure LF line endings for Linux compatibility
Write-Host "Converting line endings to LF..."
$textExtensions = @(".php", ".htaccess", ".sql", ".js", ".css", ".html", ".txt", ".json", ".map")
Get-ChildItem -Path $staging -Recurse -File | ForEach-Object {
    if ($textExtensions -contains $_.Extension) {
        try {
            $content = [IO.File]::ReadAllText($_.FullName)
            if ($content -match "`r`n") {
                $content = $content -replace "`r`n", "`n"
                [IO.File]::WriteAllText($_.FullName, $content, (New-Object System.Text.UTF8Encoding($false)))
            }
        } catch {
            Write-Warning "Could not convert $($_.Name): $($_.Exception.Message)"
        }
    }
}

Write-Host "Staging complete."
