/**
 * ==========================================
 * Facebook Image Scraper (Playwright)
 * ==========================================
 * 
 * Lädt alle Bilder von einer Facebook-Seite herunter und verpackt sie als ZIP.
 * Nutzt die /photos Unterseite für optimale Ergebnisse.
 * 
 * ==========================================
 * INSTALLATION:
 * ==========================================
 * npm install -D playwright archiver
 * 
 * Edge (Windows vorinstalliert) - KEINE extra Installation nötig!
 * 
 * Optional (andere Browser):
 * npx playwright install chromium
 * npx playwright install firefox
 * npx playwright install webkit
 * 
 * ==========================================
 * COOKIES EXPORTIEREN (für Login):
 * ==========================================
 * 1. In Chrome/Firefox bei Facebook einloggen
 * 2. Extension installieren: "Cookie-Editor" oder "EditThisCookie"
 * 3. Cookies als JSON exportieren
 * 4. Als "facebook-cookies.json" im scripts-Ordner speichern
 * 5. Format: { "cookies": [...] } oder direkt [...]
 * 
 * ==========================================
 * VERWENDUNG:
 * ==========================================
 * node scripts/facebook-image-scraper.js <url> <outputDir> [options]
 * 
 * Optionen:
 *   --cookies=<path>         Pfad zu cookies.json (optional)
 *   --headful                Browser sichtbar machen (default: headless)
 *   --browser=<name>         Browser: msedge, chromium, firefox, webkit (default: msedge)
 *   --maxScrolls=<n>         Max. Scroll-Durchläufe (default: 80)
 *   --scrollDelayMs=<n>      Verzögerung zwischen Scrolls in ms (default: 1500, langsamer = mehr Bilder)
 *   --scrollDistance=<n>     Pixel pro Scroll (default: 800, kleiner = sanfter)
 *   --maxImages=<n>          Max. Anzahl Bilder (default: 15, 0 = unbegrenzt)
 *   --concurrency=<n>        Parallele Downloads (default: 4)
 *   --timeoutMs=<n>          Timeout pro Download in ms (default: 30000)
 * 
 * ==========================================
 * BEISPIELE:
 * ==========================================
 * # Standard (nutzt automatisch scripts/facebook-cookies.json falls vorhanden):
 * node scripts/facebook-image-scraper.js https://www.facebook.com/77stylesalon/ c:\temp3
 * 
 * # Mit anderen Cookies:
 * node scripts/facebook-image-scraper.js https://www.facebook.com/77stylesalon/ c:\temp3 --cookies=meine-cookies.json
 * 
 * # Mit mehr Scrolls und sichtbarem Browser:
 * node scripts/facebook-image-scraper.js https://www.facebook.com/77stylesalon/ c:\temp3 --maxScrolls=150 --headful
 * 
 * # Langsames Scrollen für mehr Bilder (empfohlen):
 * node scripts/facebook-image-scraper.js https://www.facebook.com/77stylesalon/ c:\temp3 --scrollDelayMs=2000 --scrollDistance=600
 * 
 * # Hinweis: Das Skript nutzt automatisch die /photos Unterseite für beste Ergebnisse!
 * 
 * ==========================================
 * OUTPUT:
 * ==========================================
 * Erzeugt im outputDir:
 *   - bilder_facebook_<seitenname>.zip    (Alle Bilder)
 *   - manifest.json                        (Scraping-Statistiken)
 *   - image-links.txt                      (Debug: Alle gefundenen URLs)
 *   - photo-page-links.txt                 (Debug: Foto-Seiten)
 * 
 * ==========================================
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// CLI ARGUMENT PARSING
// ==========================================

function parseArgs() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('❌ Fehler: URL und Output-Verzeichnis erforderlich!\n');
    console.log('Verwendung:');
    console.log('  node scripts/facebook-image-scraper.js <url> <outputDir> [options]\n');
    console.log('Beispiel:');
    console.log('  node scripts/facebook-image-scraper.js https://www.facebook.com/77stylesalon/ c:\\temp3\n');
    console.log('Hinweis: Lege facebook-cookies.json im scripts-Ordner ab für automatischen Cookie-Login.\n');
    process.exit(1);
  }
  
  // Default: Versuche facebook-cookies.json im scripts-Verzeichnis zu laden
  const defaultCookiesPath = path.join(__dirname, 'facebook-cookies.json');
  
  const config = {
    url: args[0],
    outputDir: args[1],
    cookies: fs.existsSync(defaultCookiesPath) ? defaultCookiesPath : null,
    headful: true,
    browser: 'msedge',  // msedge, chromium, firefox, webkit
    maxScrolls: 20,
    scrollDelayMs: 1000,      // Zeit zwischen Scrolls (ms) - langsamer = mehr Bilder
    scrollDistance: 800,      // Pixel pro Scroll - kleiner = sanfter
    maxImages: 5,            // Max. Anzahl Bilder (0 = unbegrenzt)
    concurrency: 4,
    timeoutMs: 30000
  };
  
  // Parse flags
  for (let i = 2; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--cookies=')) {
      config.cookies = arg.substring('--cookies='.length);
    } else if (arg === '--headful') {
      config.headful = true;
    } else if (arg.startsWith('--browser=')) {
      config.browser = arg.substring('--browser='.length);
    } else if (arg.startsWith('--maxScrolls=')) {
      config.maxScrolls = parseInt(arg.substring('--maxScrolls='.length), 10);
    } else if (arg.startsWith('--scrollDelayMs=')) {
      config.scrollDelayMs = parseInt(arg.substring('--scrollDelayMs='.length), 10);
    } else if (arg.startsWith('--scrollDistance=')) {
      config.scrollDistance = parseInt(arg.substring('--scrollDistance='.length), 10);
    } else if (arg.startsWith('--maxImages=')) {
      config.maxImages = parseInt(arg.substring('--maxImages='.length), 10);
    } else if (arg.startsWith('--concurrency=')) {
      config.concurrency = parseInt(arg.substring('--concurrency='.length), 10);
    } else if (arg.startsWith('--timeoutMs=')) {
      config.timeoutMs = parseInt(arg.substring('--timeoutMs='.length), 10);
    }
  }
  
  return config;
}

// ==========================================
// UTILITIES
// ==========================================

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function extractPageName(url) {
  try {
    const urlObj = new URL(url);
    let pathname = urlObj.pathname.replace(/^\/+|\/+$/g, '');
    
    const parts = pathname.split('/').filter(p => p && p !== 'pages');
    const name = parts[parts.length - 1] || 'facebook-page';
    
    return name.replace(/[^a-zA-Z0-9]/g, '_');
  } catch {
    return 'facebook-page';
  }
}

function sha1(str) {
  return crypto.createHash('sha1').update(str).digest('hex');
}

function getExtensionFromContentType(contentType) {
  if (!contentType) return '.bin';
  
  const lower = contentType.toLowerCase();
  if (lower.includes('jpeg') || lower.includes('jpg')) return '.jpg';
  if (lower.includes('png')) return '.png';
  if (lower.includes('webp')) return '.webp';
  if (lower.includes('gif')) return '.gif';
  if (lower.includes('svg')) return '.svg';
  
  return '.bin';
}

function getFilenameFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const segments = pathname.split('/').filter(s => s);
    
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      const cleanName = lastSegment.split('?')[0];
      
      if (/\.[a-z0-9]{2,5}$/i.test(cleanName)) {
        return cleanName;
      }
    }
    
    return null;
  } catch {
    return null;
  }
}

// ==========================================
// COOKIE HANDLING
// ==========================================

async function loadCookies(cookiesPath) {
  if (!cookiesPath) return null;
  
  if (!fs.existsSync(cookiesPath)) {
    console.log(`⚠️  Cookie-Datei nicht gefunden: ${cookiesPath}`);
    return null;
  }
  
  try {
    const raw = fs.readFileSync(cookiesPath, 'utf-8');
    const json = JSON.parse(raw);
    
    let cookies = Array.isArray(json) ? json : json.cookies;
    
    if (!Array.isArray(cookies)) {
      console.log('⚠️  Cookie-Format ungültig (erwartet Array)');
      return null;
    }
    
    cookies = cookies.map(c => {
      const cookie = {
        name: c.name,
        value: c.value,
        domain: c.domain || '.facebook.com',
        path: c.path || '/',
        expires: c.expirationDate || c.expires || -1,
        httpOnly: c.httpOnly !== undefined ? c.httpOnly : false,
        secure: c.secure !== undefined ? c.secure : true,
        sameSite: normalizeSameSite(c.sameSite)
      };
      
      if (cookie.domain && !cookie.domain.startsWith('.') && cookie.domain.includes('facebook')) {
        cookie.domain = '.' + cookie.domain;
      }
      
      return cookie;
    });
    
    console.log(`✅ ${cookies.length} Cookies geladen`);
    return cookies;
    
  } catch (err) {
    console.log(`❌ Fehler beim Laden der Cookies: ${err.message}`);
    return null;
  }
}

function normalizeSameSite(sameSite) {
  if (!sameSite) return 'Lax';
  
  const lower = sameSite.toLowerCase();
  if (lower === 'none' || lower === 'no_restriction') return 'None';
  if (lower === 'lax') return 'Lax';
  if (lower === 'strict') return 'Strict';
  
  return 'Lax';
}

// ==========================================
// CONSENT DIALOG HANDLING
// ==========================================

async function handleConsentDialogs(page) {
  console.log('🍪 Versuche Cookie-Banner/Login-Dialoge zu schließen...');
  
  try {
    await delay(2000);
    
    const buttonTexts = [
      'Alle Cookies erlauben',
      'Alle akzeptieren',
      'Allow all cookies',
      'Accept all cookies',
      'Accept All',
      'Allow essential and optional cookies'
    ];
    
    for (const text of buttonTexts) {
      try {
        const button = page.locator(`button:has-text("${text}")`).first();
        if (await button.isVisible({ timeout: 1000 })) {
          await button.click();
          console.log(`   ✓ Geklickt: "${text}"`);
          await delay(2000);
          return;
        }
      } catch (e) {}
    }
    
    try {
      const closeButton = page.locator('[aria-label="Close"], [aria-label="Schließen"]').first();
      if (await closeButton.isVisible({ timeout: 1000 })) {
        await closeButton.click();
        console.log('   ✓ Login-Dialog geschlossen (X)');
        await delay(2000);
        return;
      }
    } catch (e) {}
    
    try {
      const notNow = page.locator('button:has-text("Not Now"), button:has-text("Nicht jetzt")').first();
      if (await notNow.isVisible({ timeout: 1000 })) {
        await notNow.click();
        console.log('   ✓ "Nicht jetzt" geklickt');
        await delay(2000);
        return;
      }
    } catch (e) {}
    
    console.log('   ℹ️  Keine Dialoge gefunden oder bereits geschlossen');
    
  } catch (err) {
    console.log('   ⚠️  Fehler beim Dialog-Handling:', err.message);
  }
}

// ==========================================
// PHOTO GALLERY EXTRACTION
// ==========================================

async function extractPhotoLinks(page) {
  console.log('🔗 Extrahiere Foto-Links von /photos Seite...');
  
  const photoLinks = await page.evaluate(() => {
    const links = [];
    
    const anchors = document.querySelectorAll('a[href*="photo.php"], a[href*="/photo/"], a[href*="fbid="]');
    
    anchors.forEach(a => {
      if (a.href && (a.href.includes('photo.php') || a.href.includes('/photo/'))) {
        links.push(a.href);
      }
    });
    
    return [...new Set(links)];
  });
  
  console.log(`   ✓ ${photoLinks.length} Foto-Seiten gefunden`);
  return photoLinks;
}

// ==========================================
// LOGO EXTRACTION
// ==========================================

async function extractLogo(page) {
  console.log('🖼️  Extrahiere Seiten-Logo...');
  
  try {
    const result = await page.evaluate(() => {
      const debug = [];
      
      // Suche nach SVG mit aria-label (enthält Seitennamen)
      const svgs = document.querySelectorAll('svg[aria-label]');
      debug.push(`Gefundene SVGs mit aria-label: ${svgs.length}`);
      
      for (const svg of svgs) {
        const ariaLabel = svg.getAttribute('aria-label');
        const styleAttr = svg.getAttribute('style') || '';
        debug.push(`SVG aria-label: "${ariaLabel}", style: "${styleAttr}"`);
        
        // Prüfe ob height im style >100px ist
        const heightMatch = styleAttr.match(/height:\s*(\d+)px/);
        const height = heightMatch ? parseInt(heightMatch[1], 10) : 0;
        debug.push(`  → Extrahierte height: ${height}px`);
        
        if (height <= 100) {
          debug.push(`  → Height zu klein (${height}px <= 100px), überspringe`);
          continue;
        }
        
        debug.push(`  → Height OK (${height}px > 100px), suche nach <image>...`);
        
        // Suche nach <image> Element mit xlink:href im SVG
        const imageElement = svg.querySelector('image');
        
        if (imageElement) {
          debug.push('  → <image> Element gefunden');
          
          // Versuche beide Attribute (href und xlink:href)
          const href = imageElement.getAttribute('href') || imageElement.getAttribute('xlink:href');
          debug.push(`  → href Wert: ${href}`);
          
          if (href && href.includes('scontent')) {
            debug.push(`  → ✓ Enthält 'scontent', verwende dieses Bild`);
            
            // Suche nach dem umschließenden <a>-Tag für die Galerie-URL
            let galleryUrl = null;
            let parent = svg.parentElement;
            while (parent && parent.tagName !== 'BODY') {
              if (parent.tagName === 'A' && parent.href) {
                galleryUrl = parent.href;
                debug.push(`  → Galerie-Link gefunden: ${galleryUrl}`);
                break;
              }
              parent = parent.parentElement;
            }
            
            if (!galleryUrl) {
              debug.push(`  → ⚠️  Kein umschließender <a>-Tag gefunden`);
            }
            
            return { url: href, galleryUrl, debug };
          } else if (href) {
            debug.push(`  → Enthält NICHT 'scontent'`);
          }
        } else {
          debug.push('  → Kein <image> Element in diesem SVG');
        }
      }
      
      debug.push('Fallback: Suche nach Profilbild mit data-imgperflogname...');
      
      // Fallback: Suche nach img mit bestimmten Klassen (Profilbild)
      const profileImg = document.querySelector('img[data-imgperflogname="profileCoverPhoto"]');
      if (profileImg) {
        debug.push(`Profilbild gefunden, src: ${profileImg.src}`);
        if (profileImg.src && profileImg.src.includes('scontent')) {
          debug.push('→ ✓ Enthält scontent, verwende Profilbild');
          return { url: profileImg.src, debug };
        }
      } else {
        debug.push('Kein Profilbild gefunden');
      }
      
      return { url: null, debug };
    });
    
    // Ausgabe aller Debug-Informationen
    console.log('   Debug-Informationen:');
    result.debug.forEach(msg => console.log(`     ${msg}`));
    
    if (result.url) {
      console.log(`   ✓ Logo gefunden: ${result.url}`);
      if (result.galleryUrl) {
        console.log(`   ✓ Galerie-Link gefunden: ${result.galleryUrl}`);
      }
      return { logoUrl: result.url, galleryUrl: result.galleryUrl };
    } else {
      console.log('   ⚠️  Kein Logo gefunden');
      return null;
    }
    
  } catch (err) {
    console.log(`   ⚠️  Fehler beim Logo-Extrahieren: ${err.message}`);
    return null;
  }
}

async function extractLargeLogoFromGallery(page, galleryUrl) {
  console.log('🖼️  Extrahiere großes Logo von Galerie...');
  
  if (!galleryUrl) {
    console.log('   ⚠️  Keine Galerie-URL vorhanden');
    return null;
  }
  
  try {
    console.log(`   📄 Öffne Galerie: ${galleryUrl}`);
    
    await page.goto(galleryUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await delay(2000);
    
    const largeLogoUrl = await page.evaluate(() => {
      // Suche nach dem Hauptbild (gleicher Selector wie für Galerie-Bilder)
      const mainImage = document.querySelector('img[data-visualcompletion="media-vc-image"]');
      if (mainImage && mainImage.src) {
        return mainImage.src;
      }
      
      // Fallback: Größtes Bild mit scontent
      const images = Array.from(document.querySelectorAll('img'));
      const validImages = images
        .filter(img => img.src && img.src.includes('scontent'))
        .map(img => ({
          src: img.src,
          width: img.naturalWidth || img.width || 0,
          height: img.naturalHeight || img.height || 0
        }))
        .sort((a, b) => (b.width * b.height) - (a.width * a.height));
      
      if (validImages.length > 0) {
        return validImages[0].src;
      }
      
      return null;
    });
    
    if (largeLogoUrl) {
      console.log(`   ✓ Großes Logo gefunden: ${largeLogoUrl}`);
      return largeLogoUrl;
    } else {
      console.log('   ⚠️  Kein großes Logo auf Galerie-Seite gefunden');
      return null;
    }
    
  } catch (err) {
    console.log(`   ⚠️  Fehler beim Extrahieren des großen Logos: ${err.message}`);
    return null;
  }
}

async function extractImageFromPhotoPage(page, photoUrl, retryCount = 0, index = 0, total = 0) {
  try {
    console.log(`\n   🔍 [${index + 1}/${total}] Öffne Galerie: ${photoUrl}`);
    
    await page.goto(photoUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await delay(1500);
    
    const imageUrl = await page.evaluate(() => {
      const mainImage = document.querySelector('img[data-visualcompletion="media-vc-image"]');
      if (mainImage && mainImage.src) {
        return mainImage.src;
      }
      
      const images = Array.from(document.querySelectorAll('img'));
      const validImages = images
        .filter(img => img.src && img.src.includes('scontent'))
        .map(img => ({
          src: img.src,
          width: img.naturalWidth || img.width || 0,
          height: img.naturalHeight || img.height || 0
        }))
        .sort((a, b) => (b.width * b.height) - (a.width * a.height));
      
      if (validImages.length > 0) {
        return validImages[0].src;
      }
      
      const imgWithSrcset = document.querySelector('img[srcset*="scontent"]');
      if (imgWithSrcset && imgWithSrcset.srcset) {
        const srcsetParts = imgWithSrcset.srcset.split(',');
        const lastPart = srcsetParts[srcsetParts.length - 1].trim();
        const url = lastPart.split(/\s+/)[0];
        if (url) return url;
      }
      
      return null;
    });
    
    if (imageUrl) {
      // Behalte Query-Parameter - diese enthalten Authentifizierungs-Token!
      console.log(`      ✅ Bild gefunden: ${imageUrl}`);
      return imageUrl;
    }
    
    console.log(`      ⚠️  Kein Bild gefunden auf dieser Seite`);
    return null;
    
  } catch (err) {
    if (retryCount < 2) {
      console.log(`   ⚠️  Retry ${retryCount + 1}/2 für ${photoUrl}`);
      await delay(2000);
      return await extractImageFromPhotoPage(page, photoUrl, retryCount + 1);
    }
    
    console.log(`   ❌ Fehler bei ${photoUrl}: ${err.message}`);
    return null;
  }
}

async function processPhotoGallery(page, photoLinks, maxImages = 0) {
  const limit = maxImages > 0 ? Math.min(maxImages, photoLinks.length) : photoLinks.length;
  
  console.log(`\n📸 Verarbeite ${limit} Foto-Seiten${maxImages > 0 ? ` (limitiert auf ${maxImages})` : ''}...`);
  
  const imageUrls = [];
  let processed = 0;
  
  for (let i = 0; i < limit; i++) {
    const photoLink = photoLinks[i];
    
    const imageUrl = await extractImageFromPhotoPage(page, photoLink, 0, i, limit);
    
    if (imageUrl) {
      imageUrls.push(imageUrl);
    }
    
    processed++;
    
    await delay(500);
  }
  
  console.log(`\n   ✓ ${imageUrls.length} hochauflösende Bilder extrahiert`);
  
  return [...new Set(imageUrls)];
}

// ==========================================
// SCROLLING
// ==========================================

async function autoScroll(page, maxScrolls, scrollDelayMs, scrollDistance) {
  console.log(`⬇️  Scrolle durch die Seite (max ${maxScrolls} Durchläufe, ${scrollDelayMs}ms delay, ${scrollDistance}px)...`);
  
  let scrollCount = 0;
  let noNewImagesCount = 0;
  let lastImageCount = 0;
  let lastHeight = 0;
  
  while (scrollCount < maxScrolls) {
    await page.evaluate((distance) => {
      window.scrollBy(0, distance);
    }, scrollDistance);
    
    scrollCount++;
    await delay(scrollDelayMs);
    
    const currentImageCount = await page.evaluate(() => {
      return document.querySelectorAll('img').length;
    });
    
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);
    
    if (currentImageCount === lastImageCount && currentHeight === lastHeight) {
      noNewImagesCount++;
      if (noNewImagesCount >= 3) {
        console.log(`   ℹ️  Keine neuen Inhalte mehr (nach ${scrollCount} Scrolls)`);
        break;
      }
    } else {
      noNewImagesCount = 0;
    }
    
    lastImageCount = currentImageCount;
    lastHeight = currentHeight;
    
    if (scrollCount % 10 === 0) {
      process.stdout.write(`   Scroll ${scrollCount}/${maxScrolls} (${currentImageCount} Bilder)\r`);
    }
  }
  
  console.log(`\n   ✓ Scrolling abgeschlossen (${scrollCount} Durchläufe)`);
}

// ==========================================
// DOWNLOAD & ZIP
// ==========================================

async function downloadAndZipImages(context, imageUrls, outputZipPath, timeoutMs, concurrency, logoUrl = null, largeLogoUrl = null) {
  console.log(`\n📥 Lade ${imageUrls.length} Bilder herunter${logoUrl ? ' + Logo' : ''}${largeLogoUrl ? ' + großes Logo' : ''}...`);
  
  const results = {
    downloaded: [],
    skipped: [],
    errors: [],
    logo: null,
    largeLogo: null
  };
  
  const usedFilenames = new Map();
  const zipStream = fs.createWriteStream(outputZipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  
  archive.pipe(zipStream);
  
  // Download Logo falls vorhanden
  if (logoUrl) {
    try {
      console.log(`\n   🖼️  Lade Logo herunter...`);
      
      const response = await context.request.get(logoUrl, { 
        timeout: timeoutMs,
        failOnStatusCode: false,
        headers: {
          'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Referer': 'https://www.facebook.com/'
        }
      });
      
      if (response.status() === 200) {
        const contentType = response.headers()['content-type'] || '';
        const buffer = await response.body();
        const ext = getExtensionFromContentType(contentType);
        const logoFilename = `logo${ext}`;
        
        archive.append(buffer, { name: logoFilename });
        
        console.log(`      ✅ Logo erfolgreich: ${logoFilename} (${(buffer.length / 1024).toFixed(1)} KB)`);
        results.logo = { url: logoUrl, filename: logoFilename, size: buffer.length };
      } else {
        console.log(`      ⚠️  Logo-Download fehlgeschlagen: HTTP ${response.status()}`);
      }
    } catch (err) {
      console.log(`      ⚠️  Logo-Download Fehler: ${err.message}`);
    }
  }
  
  // Download großes Logo falls vorhanden
  if (largeLogoUrl) {
    try {
      console.log(`\n   🖼️  Lade großes Logo herunter...`);
      
      const response = await context.request.get(largeLogoUrl, { 
        timeout: timeoutMs,
        failOnStatusCode: false,
        headers: {
          'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Referer': 'https://www.facebook.com/'
        }
      });
      
      if (response.status() === 200) {
        const contentType = response.headers()['content-type'] || '';
        const buffer = await response.body();
        const ext = getExtensionFromContentType(contentType);
        const largeLogoFilename = `logo_gross${ext}`;
        
        archive.append(buffer, { name: largeLogoFilename });
        
        console.log(`      ✅ Großes Logo erfolgreich: ${largeLogoFilename} (${(buffer.length / 1024).toFixed(1)} KB)`);
        results.largeLogo = { url: largeLogoUrl, filename: largeLogoFilename, size: buffer.length };
      } else {
        console.log(`      ⚠️  Großes Logo-Download fehlgeschlagen: HTTP ${response.status()}`);
      }
    } catch (err) {
      console.log(`      ⚠️  Großes Logo-Download Fehler: ${err.message}`);
    }
  }
  
  const queue = [...imageUrls];
  const activeDownloads = new Set();
  
  const downloadImage = async (url, index) => {
    try {
      console.log(`\n   📥 [${index + 1}/${imageUrls.length}] Lade herunter: ${url}`);
      
      const response = await context.request.get(url, { 
        timeout: timeoutMs,
        failOnStatusCode: false,
        headers: {
          'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Referer': 'https://www.facebook.com/'
        }
      });
      
      const status = response.status();
      console.log(`      Status: ${status}`);
      
      if (status === 429) {
        console.log(`\n   ⏳ Rate limit (429), warte 5s...`);
        await delay(5000);
        throw new Error('Rate limited, retry');
      }
      
      if (status !== 200) {
        console.log(`      ⊘ Übersprungen: HTTP ${status}`);
        results.skipped.push({ url, reason: `HTTP ${status}` });
        return;
      }
      
      const contentType = response.headers()['content-type'] || '';
      console.log(`      Content-Type: ${contentType}`);
      
      if (!contentType.startsWith('image/')) {
        console.log(`      ⊘ Übersprungen: Kein Bild (${contentType})`);
        results.skipped.push({ url, reason: `Not an image (${contentType})` });
        return;
      }
      
      const buffer = await response.body();
      
      let filename = getFilenameFromUrl(url);
      
      if (!filename) {
        const hash = sha1(url).substring(0, 12);
        const ext = getExtensionFromContentType(contentType);
        filename = `${hash}${ext}`;
      } else {
        const ext = getExtensionFromContentType(contentType);
        if (!filename.toLowerCase().endsWith(ext)) {
          filename = filename.replace(/\.[^.]+$/, '') + ext;
        }
      }
      
      let finalFilename = filename;
      const baseFilename = filename.replace(/\.[^.]+$/, '');
      const extension = filename.match(/\.[^.]+$/)?.[0] || '';
      
      if (usedFilenames.has(filename)) {
        const count = usedFilenames.get(filename);
        finalFilename = `${baseFilename}_${count + 1}${extension}`;
        usedFilenames.set(filename, count + 1);
      } else {
        usedFilenames.set(filename, 1);
      }
      
      archive.append(buffer, { name: finalFilename });
      
      console.log(`      ✅ Erfolgreich: ${finalFilename} (${(buffer.length / 1024).toFixed(1)} KB)`);
      results.downloaded.push({ url, filename: finalFilename, size: buffer.length });
      
    } catch (err) {
      const isRetryable = err.message.includes('Rate limited') || 
                          err.message.includes('timeout') ||
                          err.message.includes('ECONNRESET') ||
                          err.message.includes('ETIMEDOUT');
      
      results.errors.push({ url, error: err.message, retryable: isRetryable });
    }
  };
  
  let downloadIndex = 0;
  
  while (queue.length > 0 || activeDownloads.size > 0) {
    while (activeDownloads.size < concurrency && queue.length > 0) {
      const url = queue.shift();
      const currentIndex = downloadIndex++;
      
      const promise = downloadImage(url, currentIndex).finally(() => {
        activeDownloads.delete(promise);
        
        const done = results.downloaded.length + results.skipped.length + results.errors.length;
        process.stdout.write(`   ${done}/${imageUrls.length} (✓ ${results.downloaded.length}, ✗ ${results.errors.length}, ⊘ ${results.skipped.length})\r`);
      });
      
      activeDownloads.add(promise);
    }
    
    if (activeDownloads.size > 0) {
      await Promise.race(activeDownloads);
    }
  }
  
  console.log(`\n   ✅ Download abgeschlossen`);
  
  const retryableErrors = results.errors.filter(e => e.retryable);
  if (retryableErrors.length > 0) {
    console.log(`\n🔄 Wiederhole ${retryableErrors.length} fehlgeschlagene Downloads (Retry 1/2)...`);
    
    const originalErrorCount = results.errors.length;
    
    for (const err of retryableErrors) {
      const fullUrl = imageUrls.find(u => u.startsWith(err.url.replace('...', '')));
      if (fullUrl) {
        await delay(1000);
        await downloadImage(fullUrl);
      }
    }
    
    results.errors = results.errors.filter(e => 
      !results.downloaded.find(d => d.url && d.url.startsWith(e.url.replace('...', '')))
    );
    
    const retriedSuccessfully = originalErrorCount - results.errors.length;
    if (retriedSuccessfully > 0) {
      console.log(`   ✓ ${retriedSuccessfully} Bilder erfolgreich nachgeladen`);
    }
    
    const stillFailing = results.errors.filter(e => e.retryable);
    if (stillFailing.length > 0) {
      console.log(`\n🔄 Zweiter Versuch für ${stillFailing.length} Bilder (Retry 2/2)...`);
      
      for (const err of stillFailing) {
        const fullUrl = imageUrls.find(u => u.startsWith(err.url.replace('...', '')));
        if (fullUrl) {
          await delay(2000);
          await downloadImage(fullUrl);
        }
      }
      
      results.errors = results.errors.filter(e => 
        !results.downloaded.find(d => d.url && d.url.startsWith(e.url.replace('...', '')))
      );
    }
  }
  
  console.log('\n📦 Erstelle ZIP-Archiv...');
  archive.finalize();
  
  await new Promise((resolve, reject) => {
    zipStream.on('close', resolve);
    zipStream.on('error', reject);
  });
  
  const zipSize = fs.statSync(outputZipPath).size;
  console.log(`   ✓ ZIP erstellt: ${(zipSize / 1024 / 1024).toFixed(2)} MB`);
  
  return results;
}

// ==========================================
// DETECTION OF BLOCKING
// ==========================================

async function detectBlocking(page) {
  const bodyText = await page.evaluate(() => document.body.innerText.toLowerCase());
  
  const blockIndicators = [
    'you\'re temporarily blocked',
    'vorübergehend blockiert',
    'log in to facebook',
    'bei facebook anmelden',
    'create new account',
    'neues konto erstellen'
  ];
  
  for (const indicator of blockIndicators) {
    if (bodyText.includes(indicator)) {
      return true;
    }
  }
  
  return false;
}

// ==========================================
// MAIN FUNCTION
// ==========================================

async function main() {
  const config = parseArgs();
  
  console.log('🚀 Facebook Image Scraper (Playwright)\n');
  console.log(`📱 URL: ${config.url}`);
  console.log(`📁 Output: ${config.outputDir}`);
  console.log(`🌐 Browser: ${config.browser}`);
  console.log(`🍪 Cookies: ${config.cookies ? path.basename(config.cookies) : 'Keine (nur öffentliche Bilder)'}`);
  console.log(`🎬 Headless: ${!config.headful}`);
  console.log(`📊 Max Scrolls: ${config.maxScrolls}`);
  console.log(`🖼️  Max Bilder: ${config.maxImages > 0 ? config.maxImages : 'Unbegrenzt'}`);
  console.log(`⏱️  Scroll: ${config.scrollDelayMs}ms Delay, ${config.scrollDistance}px Distanz`);
  console.log(`🔢 Concurrency: ${config.concurrency}\n`);
  
  const pageName = extractPageName(config.url);
  const zipFilename = `bilder_facebook_${pageName}.zip`;
  const zipPath = path.join(config.outputDir, zipFilename);
  
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }
  
  let browser;
  let exitCode = 0;
  let imageUrls = [];
  let photoPageUrls = [];
  
  try {
    const cookies = await loadCookies(config.cookies);
    
    console.log(`🌐 Starte Browser (${config.browser})...`);
    
    if (config.browser === 'msedge' || config.browser === 'edge') {
      browser = await chromium.launch({ 
        channel: 'msedge',
        headless: !config.headful,
        args: ['--disable-blink-features=AutomationControlled']
      });
    } else if (config.browser === 'firefox') {
      const { firefox } = await import('playwright');
      browser = await firefox.launch({ 
        headless: !config.headful
      });
    } else if (config.browser === 'webkit') {
      const { webkit } = await import('playwright');
      browser = await webkit.launch({ 
        headless: !config.headful
      });
    } else {
      browser = await chromium.launch({ 
        headless: !config.headful,
        args: ['--disable-blink-features=AutomationControlled']
      });
    }
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });
    
    if (cookies && cookies.length > 0) {
      await context.addCookies(cookies);
      console.log('   ✓ Cookies gesetzt');
    }
    
    const page = await context.newPage();
    
    console.log('📄 Lade Facebook /photos Seite...');
    
    let photosUrl = config.url;
    if (!photosUrl.endsWith('/photos')) {
      photosUrl = photosUrl.replace(/\/$/, '') + '/photos';
    }
    
    await page.goto(photosUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 60000 
    });
    
    try {
      await page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (e) {}
    
    await handleConsentDialogs(page);
    
    // Extrahiere Logo von der Hauptseite
    const logoResult = await extractLogo(page);
    const logoUrl = logoResult?.logoUrl || null;
    const logoGalleryUrl = logoResult?.galleryUrl || null;
    
    // Extrahiere großes Logo von der Galerie
    let largeLogoUrl = null;
    if (logoGalleryUrl) {
      largeLogoUrl = await extractLargeLogoFromGallery(page, logoGalleryUrl);
    }
    
    const isBlocked = await detectBlocking(page);
    
    if (isBlocked) {
      console.log('\n⚠️  WARNUNG: Facebook blockiert oder Login erforderlich!');
      console.log('   → Bitte verwende facebook-cookies.json mit einer eingeloggten Session.\n');
      
      if (!cookies) {
        console.log('❌ Keine Cookies vorhanden. Abbruch.\n');
        await browser.close();
        process.exit(2);
      }
      
      console.log('   ℹ️  Versuche trotzdem fortzufahren...\n');
    }
    
    await autoScroll(page, config.maxScrolls, config.scrollDelayMs, config.scrollDistance);
    
    const photoLinks = await extractPhotoLinks(page);
    
    if (photoLinks.length === 0) {
      console.log('\n⚠️  Keine Foto-Links gefunden!\n');
      await browser.close();
      process.exit(2);
    }
    
    const extractedImageUrls = await processPhotoGallery(page, photoLinks, config.maxImages);
    
    if (extractedImageUrls.length === 0) {
      console.log('\n⚠️  Keine Bilder extrahiert!\n');
      await browser.close();
      process.exit(2);
    }
    
    imageUrls = extractedImageUrls;
    photoPageUrls = photoLinks;
    
    fs.writeFileSync(
      path.join(config.outputDir, 'image-links.txt'),
      imageUrls.join('\n'),
      'utf-8'
    );
    
    if (photoPageUrls.length > 0) {
      fs.writeFileSync(
        path.join(config.outputDir, 'photo-page-links.txt'),
        photoPageUrls.join('\n'),
        'utf-8'
      );
    }
    
    const results = await downloadAndZipImages(
      context,
      imageUrls,
      zipPath,
      config.timeoutMs,
      config.concurrency,
      logoUrl,
      largeLogoUrl
    );
    
    const manifest = {
      pageUrl: config.url,
      pageName,
      scrapedAt: new Date().toISOString(),
      zipPath: zipFilename,
      totalFound: imageUrls.length,
      totalDownloaded: results.downloaded.length,
      totalSkipped: results.skipped.length,
      totalErrors: results.errors.length,
      logo: results.logo,
      largeLogo: results.largeLogo,
      downloaded: results.downloaded,
      skipped: results.skipped,
      errors: results.errors
    };
    
    fs.writeFileSync(
      path.join(config.outputDir, 'manifest.json'),
      JSON.stringify(manifest, null, 2),
      'utf-8'
    );
    
    console.log('\n✅ Fertig!\n');
    console.log(`📊 Statistik:`);
    console.log(`   🖼️  Logo:            ${results.logo ? '✓ Heruntergeladen' : '✗ Nicht gefunden'}`);
    console.log(`   🖼️  Logo (groß):     ${results.largeLogo ? '✓ Heruntergeladen' : '✗ Nicht gefunden'}`);
    console.log(`   URLs gefunden:    ${imageUrls.length}`);
    console.log(`   ✓ Heruntergeladen: ${results.downloaded.length} (${((results.downloaded.length / imageUrls.length) * 100).toFixed(1)}%)`);
    console.log(`   ⊘ Übersprungen:    ${results.skipped.length}`);
    console.log(`   ✗ Fehlgeschlagen:  ${results.errors.length}`);
    
    if (results.errors.length > 0) {
      console.log(`\n❌ Fehlerhafte URLs (erste 5):`);
      results.errors.slice(0, 5).forEach(err => {
        console.log(`   • ${err.url}`);
        console.log(`     Grund: ${err.error}`);
      });
    }
    
    console.log(`\n📦 ZIP: ${zipPath}`);
    console.log(`📄 Manifest: ${path.join(config.outputDir, 'manifest.json')}\n`);
    
    if (results.downloaded.length === 0) {
      console.log('⚠️  Warnung: Keine Bilder erfolgreich heruntergeladen!');
      exitCode = 2;
    }
    
    await browser.close();
    
  } catch (err) {
    console.error('\n❌ Fehler:', err.message);
    console.error(err.stack);
    exitCode = 1;
    
    if (browser) {
      await browser.close();
    }
  }
  
  process.exit(exitCode);
}

main();
