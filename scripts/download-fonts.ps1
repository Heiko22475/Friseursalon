# =====================================================
# GOOGLE FONTS DOWNLOADER
# Downloads fonts for local hosting (DSGVO compliant)
# =====================================================

$fontsDir = "$PSScriptRoot\..\public\fonts"

# Create fonts directory if not exists
if (!(Test-Path $fontsDir)) {
    New-Item -ItemType Directory -Path $fontsDir -Force
}

# Font configurations - Google Fonts API format
$fonts = @(
    @{ name = "Inter"; weights = @(300, 400, 500, 600, 700) },
    @{ name = "Poppins"; weights = @(300, 400, 500, 600, 700, 800) },
    @{ name = "Open+Sans"; weights = @(300, 400, 500, 600, 700, 800) },
    @{ name = "Nunito"; weights = @(300, 400, 500, 600, 700, 800) },
    @{ name = "Montserrat"; weights = @(300, 400, 500, 600, 700, 800) },
    @{ name = "Lato"; weights = @(300, 400, 700, 900) },
    @{ name = "Roboto"; weights = @(300, 400, 500, 700, 900) },
    @{ name = "Work+Sans"; weights = @(300, 400, 500, 600, 700) },
    @{ name = "DM+Sans"; weights = @(400, 500, 700) },
    @{ name = "Plus+Jakarta+Sans"; weights = @(300, 400, 500, 600, 700, 800) },
    @{ name = "Raleway"; weights = @(300, 400, 500, 600, 700) },
    @{ name = "Source+Sans+3"; weights = @(300, 400, 600, 700) },
    @{ name = "Playfair+Display"; weights = @(400, 500, 600, 700, 800) },
    @{ name = "Lora"; weights = @(400, 500, 600, 700) },
    @{ name = "Merriweather"; weights = @(300, 400, 700, 900) },
    @{ name = "Source+Serif+4"; weights = @(300, 400, 600, 700) },
    @{ name = "Crimson+Pro"; weights = @(300, 400, 500, 600, 700) },
    @{ name = "Cormorant"; weights = @(300, 400, 500, 600, 700) },
    @{ name = "Libre+Baskerville"; weights = @(400, 700) },
    @{ name = "DM+Serif+Display"; weights = @(400) },
    @{ name = "Bebas+Neue"; weights = @(400) },
    @{ name = "Oswald"; weights = @(300, 400, 500, 600, 700) },
    @{ name = "Abril+Fatface"; weights = @(400) },
    @{ name = "Alfa+Slab+One"; weights = @(400) },
    @{ name = "Dancing+Script"; weights = @(400, 500, 600, 700) },
    @{ name = "Pacifico"; weights = @(400) },
    @{ name = "Great+Vibes"; weights = @(400) },
    @{ name = "Satisfy"; weights = @(400) },
    @{ name = "JetBrains+Mono"; weights = @(400, 500, 600, 700) },
    @{ name = "Fira+Code"; weights = @(300, 400, 500, 600, 700) }
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Google Fonts Downloader" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalFonts = $fonts.Count
$currentFont = 0

foreach ($font in $fonts) {
    $currentFont++
    $fontName = $font.name -replace '\+', ' '
    $fontSlug = ($font.name -replace '\+', '-').ToLower()
    
    Write-Host "[$currentFont/$totalFonts] Downloading: $fontName" -ForegroundColor Yellow
    
    # Create font directory
    $fontDir = "$fontsDir\$fontSlug"
    if (!(Test-Path $fontDir)) {
        New-Item -ItemType Directory -Path $fontDir -Force | Out-Null
    }
    
    foreach ($weight in $font.weights) {
        # Build Google Fonts CSS URL (for woff2)
        $cssUrl = "https://fonts.googleapis.com/css2?family=$($font.name):wght@$weight&display=swap"
        
        try {
            # Get CSS with woff2 user agent
            $headers = @{
                "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
            
            $css = Invoke-WebRequest -Uri $cssUrl -Headers $headers -UseBasicParsing
            $cssContent = $css.Content
            
            # Extract woff2 URL from CSS
            if ($cssContent -match "src: url\(([^)]+\.woff2)\)") {
                $woff2Url = $matches[1]
                $fileName = "$fontSlug-$weight.woff2"
                $filePath = "$fontDir\$fileName"
                
                # Download woff2 file
                Invoke-WebRequest -Uri $woff2Url -OutFile $filePath -UseBasicParsing
                Write-Host "  - Weight $weight downloaded" -ForegroundColor Green
            }
        }
        catch {
            Write-Host "  - Weight $weight FAILED: $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Download complete!" -ForegroundColor Green
Write-Host "  Fonts saved to: $fontsDir" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
