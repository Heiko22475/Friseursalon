# =====================================================
# GOOGLE FONTS DOWNLOADER v2
# Downloads fonts for local hosting (DSGVO compliant)
# =====================================================

$fontsDir = "C:\Test\FriseurWebseite\public\fonts"

# Font configurations
$fonts = @(
    @{ id = "inter"; name = "Inter"; weights = @(300, 400, 500, 600, 700) },
    @{ id = "poppins"; name = "Poppins"; weights = @(300, 400, 500, 600, 700, 800) },
    @{ id = "open-sans"; name = "Open Sans"; weights = @(300, 400, 500, 600, 700, 800) },
    @{ id = "nunito"; name = "Nunito"; weights = @(300, 400, 500, 600, 700, 800) },
    @{ id = "montserrat"; name = "Montserrat"; weights = @(300, 400, 500, 600, 700, 800) },
    @{ id = "lato"; name = "Lato"; weights = @(300, 400, 700, 900) },
    @{ id = "roboto"; name = "Roboto"; weights = @(300, 400, 500, 700, 900) },
    @{ id = "work-sans"; name = "Work Sans"; weights = @(300, 400, 500, 600, 700) },
    @{ id = "dm-sans"; name = "DM Sans"; weights = @(400, 500, 700) },
    @{ id = "plus-jakarta-sans"; name = "Plus Jakarta Sans"; weights = @(300, 400, 500, 600, 700, 800) },
    @{ id = "raleway"; name = "Raleway"; weights = @(300, 400, 500, 600, 700) },
    @{ id = "source-sans-3"; name = "Source Sans 3"; weights = @(300, 400, 600, 700) },
    @{ id = "playfair-display"; name = "Playfair Display"; weights = @(400, 500, 600, 700, 800) },
    @{ id = "lora"; name = "Lora"; weights = @(400, 500, 600, 700) },
    @{ id = "merriweather"; name = "Merriweather"; weights = @(300, 400, 700, 900) },
    @{ id = "source-serif-4"; name = "Source Serif 4"; weights = @(300, 400, 600, 700) },
    @{ id = "crimson-pro"; name = "Crimson Pro"; weights = @(300, 400, 500, 600, 700) },
    @{ id = "cormorant"; name = "Cormorant"; weights = @(300, 400, 500, 600, 700) },
    @{ id = "libre-baskerville"; name = "Libre Baskerville"; weights = @(400, 700) },
    @{ id = "dm-serif-display"; name = "DM Serif Display"; weights = @(400) },
    @{ id = "bebas-neue"; name = "Bebas Neue"; weights = @(400) },
    @{ id = "oswald"; name = "Oswald"; weights = @(300, 400, 500, 600, 700) },
    @{ id = "abril-fatface"; name = "Abril Fatface"; weights = @(400) },
    @{ id = "alfa-slab-one"; name = "Alfa Slab One"; weights = @(400) },
    @{ id = "dancing-script"; name = "Dancing Script"; weights = @(400, 500, 600, 700) },
    @{ id = "pacifico"; name = "Pacifico"; weights = @(400) },
    @{ id = "great-vibes"; name = "Great Vibes"; weights = @(400) },
    @{ id = "satisfy"; name = "Satisfy"; weights = @(400) },
    @{ id = "jetbrains-mono"; name = "JetBrains Mono"; weights = @(400, 500, 600, 700) },
    @{ id = "fira-code"; name = "Fira Code"; weights = @(300, 400, 500, 600, 700) }
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Google Fonts Downloader v2" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalFonts = $fonts.Count
$currentFont = 0
$downloadedFiles = 0

foreach ($font in $fonts) {
    $currentFont++
    $fontId = $font.id
    $fontName = $font.name
    $fontNameEncoded = $fontName -replace ' ', '+'
    
    Write-Host "[$currentFont/$totalFonts] $fontName" -ForegroundColor Yellow
    
    # Create font directory
    $fontDir = "$fontsDir\$fontId"
    if (!(Test-Path $fontDir)) {
        New-Item -ItemType Directory -Path $fontDir -Force | Out-Null
    }
    
    foreach ($weight in $font.weights) {
        $cssUrl = "https://fonts.googleapis.com/css2?family=$fontNameEncoded`:wght@$weight&display=swap"
        
        try {
            # Use modern browser user-agent to get woff2
            $response = Invoke-WebRequest -Uri $cssUrl -Headers @{
                "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            } -UseBasicParsing
            
            $cssContent = $response.Content
            
            # Find all woff2 URLs in the CSS
            $matches = [regex]::Matches($cssContent, 'url\((https://fonts\.gstatic\.com/[^)]+\.woff2)\)')
            
            if ($matches.Count -gt 0) {
                $woff2Url = $matches[0].Groups[1].Value
                $fileName = "$fontId-$weight.woff2"
                $filePath = "$fontDir\$fileName"
                
                # Download woff2 file
                Invoke-WebRequest -Uri $woff2Url -OutFile $filePath -UseBasicParsing
                $downloadedFiles++
                Write-Host "  + $weight" -ForegroundColor Green -NoNewline
                Write-Host " " -NoNewline
            }
            else {
                Write-Host "  - $weight (no woff2)" -ForegroundColor DarkYellow -NoNewline
                Write-Host " " -NoNewline
            }
        }
        catch {
            Write-Host "  x $weight" -ForegroundColor Red -NoNewline
            Write-Host " " -NoNewline
        }
    }
    Write-Host ""
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Downloaded $downloadedFiles font files" -ForegroundColor Green
Write-Host "  Location: $fontsDir" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
