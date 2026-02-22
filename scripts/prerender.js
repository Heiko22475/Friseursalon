// =====================================================
// PRERENDER SCRIPT
// Generates static HTML snapshots of public pages
// using Puppeteer. Run after `npm run build`.
//
// Usage:
//   node scripts/prerender.js
//   node scripts/prerender.js --domain=www.my-salon.de
//
// The script:
// 1. Starts the Vite preview server (serves from dist/)
// 2. Fetches the list of published pages from Supabase
// 3. Navigates Puppeteer to each public route
// 4. Waits for content to render (including SEO tags)
// 5. Saves the full HTML to dist/<route>/index.html
// =====================================================

import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import { execSync, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://localhost:${PREVIEW_PORT}`;

// ===== CONFIG =====

// Read Supabase credentials from .env or environment
function getEnvVar(name) {
  // Try process.env first
  if (process.env[name]) return process.env[name];
  // Try reading .env file
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(new RegExp(`^${name}=(.+)$`, 'm'));
    if (match) return match[1].trim();
  } catch { /* no .env file */ }
  return null;
}

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL');
const SUPABASE_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY');

// ===== PRERENDER CONFIG (from Supabase system_settings) =====

async function fetchPrerenderConfig() {
  const defaults = {
    prerender_wait_ms: 1000,
    prerender_selector_timeout_ms: 10000,
    sitemap_changefreq: 'weekly',
  };

  if (!SUPABASE_URL || !SUPABASE_KEY) return defaults;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data, error } = await supabase
      .from('system_settings')
      .select('key, value')
      .in('key', ['prerender_wait_ms', 'prerender_selector_timeout_ms', 'sitemap_changefreq']);

    if (error || !data) return defaults;

    const map = Object.fromEntries(data.map(r => [r.key, r.value]));
    return {
      prerender_wait_ms: parseInt(map.prerender_wait_ms ?? defaults.prerender_wait_ms, 10),
      prerender_selector_timeout_ms: parseInt(map.prerender_selector_timeout_ms ?? defaults.prerender_selector_timeout_ms, 10),
      sitemap_changefreq: map.sitemap_changefreq ?? defaults.sitemap_changefreq,
    };
  } catch {
    return defaults;
  }
}

// ===== HELPERS =====

function log(msg) {
  console.log(`[prerender] ${msg}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// ===== FETCH PAGES FROM SUPABASE =====

async function fetchPublishedPages(domain) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    log('⚠ No Supabase credentials found. Using fallback routes: /, /leistungen, /kontakt, /impressum, /datenschutz');
    return ['/', '/leistungen', '/kontakt', '/impressum', '/datenschutz'];
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Find the website by domain (or use first one for localhost)
  let query = supabase.from('websites').select('content');
  if (domain && domain !== 'localhost') {
    query = query.eq('domain', domain);
  }
  const { data, error } = await query.limit(1).single();

  if (error || !data?.content?.pages) {
    log(`⚠ Could not fetch pages from Supabase: ${error?.message || 'no data'}. Using fallback routes.`);
    return ['/', '/leistungen', '/kontakt', '/impressum', '/datenschutz'];
  }

  const pages = data.content.pages;
  const routes = pages
    .filter((p) => {
      const isPublished = p.isPublished ?? p.is_published ?? true;
      return isPublished;
    })
    .map((p) => {
      const isHome = p.isHome ?? p.is_home ?? false;
      return isHome ? '/' : `/${p.slug}`;
    });

  return [...new Set(routes)]; // deduplicate
}

// ===== START PREVIEW SERVER =====

function startPreviewServer() {
  return new Promise((resolve, reject) => {
    log(`Starting Vite preview server on port ${PREVIEW_PORT}...`);
    const server = spawn('npx', ['vite', 'preview', '--port', String(PREVIEW_PORT)], {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'pipe',
      shell: true,
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        started = true;
        // Assume it started even if we didn't catch the message
        resolve(server);
      }
    }, 5000);

    server.stdout.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('Local') || msg.includes(String(PREVIEW_PORT))) {
        if (!started) {
          started = true;
          clearTimeout(timeout);
          log('Preview server started.');
          resolve(server);
        }
      }
    });

    server.stderr.on('data', (data) => {
      const msg = data.toString();
      if (msg.includes('EADDRINUSE')) {
        clearTimeout(timeout);
        reject(new Error(`Port ${PREVIEW_PORT} is already in use.`));
      }
    });

    server.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

// ===== PRERENDER A SINGLE ROUTE =====

async function prerenderRoute(browser, route, config) {
  const page = await browser.newPage();
  const url = `${PREVIEW_URL}${route}`;

  log(`  Rendering: ${route}`);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait a bit for any async rendering to settle
  await new Promise(r => setTimeout(r, config.prerender_wait_ms));

  // Wait specifically for the dynamic page container to be rendered
  await page.waitForSelector('.dynamic-page, .dynamic-page-404, .dynamic-page-empty', {
    timeout: config.prerender_selector_timeout_ms,
  }).catch(() => {
    log(`  ⚠ No page container found for ${route}, saving anyway`);
  });

  // Get the full HTML
  const html = await page.content();
  await page.close();

  // Determine output path
  const outputDir = route === '/'
    ? DIST_DIR
    : path.join(DIST_DIR, ...route.split('/').filter(Boolean));

  ensureDir(outputDir);
  const outputFile = path.join(outputDir, 'index.html');

  // Don't overwrite the SPA index.html — that stays for client routing
  if (route === '/') {
    // For root, save as a separate prerendered file that can be served to bots
    fs.writeFileSync(path.join(DIST_DIR, 'index.prerendered.html'), html, 'utf-8');
    log(`  ✓ Saved: index.prerendered.html`);
  } else {
    fs.writeFileSync(outputFile, html, 'utf-8');
    log(`  ✓ Saved: ${path.relative(DIST_DIR, outputFile)}`);
  }

  return html;
}

// ===== GENERATE SITEMAP =====

function generateSitemap(routes, domain, changefreq = 'weekly') {
  const baseUrl = `https://${domain}`;
  const now = new Date().toISOString().split('T')[0];

  const urls = routes.map((route) => {
    const loc = route === '/' ? baseUrl : `${baseUrl}${route}`;
    const priority = route === '/' ? '1.0' : '0.8';
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemapindex.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml, 'utf-8');
  log(`✓ Generated sitemap.xml with ${routes.length} URLs`);
}

// ===== MAIN =====

async function main() {
  // Parse CLI args
  const args = process.argv.slice(2);
  const domainArg = args.find((a) => a.startsWith('--domain='));
  const domain = domainArg ? domainArg.split('=')[1] : 'localhost';

  log(`Domain: ${domain}`);

  // Load prerender config from Supabase
  const config = await fetchPrerenderConfig();
  log(`Config: wait=${config.prerender_wait_ms}ms, selectorTimeout=${config.prerender_selector_timeout_ms}ms, changefreq=${config.sitemap_changefreq}`);

  // Check if dist/ exists
  if (!fs.existsSync(DIST_DIR)) {
    log('❌ dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Fetch routes
  const routes = await fetchPublishedPages(domain);
  log(`Found ${routes.length} routes to prerender: ${routes.join(', ')}`);

  // Start preview server
  let server;
  try {
    server = await startPreviewServer();
  } catch (err) {
    log(`❌ Failed to start preview server: ${err.message}`);
    process.exit(1);
  }

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // Prerender each route
    for (const route of routes) {
      await prerenderRoute(browser, route, config);
    }

    // Generate sitemap
    if (domain !== 'localhost') {
      generateSitemap(routes, domain, config.sitemap_changefreq);
    } else {
      log('Skipping sitemap generation for localhost.');
    }

    log(`\n✅ Prerendering complete! ${routes.length} pages rendered.`);
  } catch (err) {
    log(`❌ Error during prerendering: ${err.message}`);
  } finally {
    await browser.close();
    server.kill();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
