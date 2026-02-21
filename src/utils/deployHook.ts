// =====================================================
// DEPLOY HOOK – Database-Driven Build Trigger
// =====================================================
//
// Compares websites.updated_at vs websites.last_build_at
// in the database. If content changed and last build was
// >2 hours ago, triggers a rebuild via webhook.
//
// Works for ANY visitor — public or admin. The check
// happens once per page load; the database is the single
// source of truth (no localStorage, works across devices).
//
// Setup: Set VITE_DEPLOY_HOOK_URL in .env to the
// webhook URL provided by your hosting platform:
//   - Vercel:    Settings → Git → Deploy Hooks
//   - Netlify:   Site Settings → Build & Deploy → Build Hooks
//   - Cloudflare: Pages → Settings → Builds → Deploy Hooks
//
// Then run supabase-deploy-hook.sql to add the
// last_build_at column to the websites table.
//
// If VITE_DEPLOY_HOOK_URL is not set, this is a no-op.
// =====================================================

import { supabase } from '../lib/supabase';

const THROTTLE_MS = 2 * 60 * 60 * 1000; // 2 hours

/**
 * Get the deploy hook URL from env. Returns null if not configured.
 */
function getHookUrl(): string | null {
  const url = import.meta.env.VITE_DEPLOY_HOOK_URL;
  return url && url !== 'undefined' ? url : null;
}

/**
 * Fire the webhook and update last_build_at in the database.
 */
async function fireWebhook(hookUrl: string, websiteId: string): Promise<boolean> {
  try {
    // Update last_build_at first to prevent parallel triggers
    const now = new Date().toISOString();
    await supabase
      .from('websites')
      .update({ last_build_at: now })
      .eq('id', websiteId);

    const response = await fetch(hookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trigger: 'beautiful-cms',
        timestamp: now,
      }),
    });

    if (!response.ok) {
      console.warn(`[DeployHook] Webhook returned ${response.status}`);
      return false;
    }

    console.info('[DeployHook] Build triggered successfully.');
    return true;
  } catch (err) {
    console.warn('[DeployHook] Failed to trigger webhook:', err);
    return false;
  }
}

/**
 * Check if a build is needed and trigger it if so.
 *
 * Call this once per page load with the website record data.
 * Safe to call from public pages — the check is lightweight
 * (no extra DB query, uses data already loaded).
 *
 * @param websiteId   - The website UUID
 * @param updatedAt   - websites.updated_at (last content change)
 * @param lastBuildAt - websites.last_build_at (last deploy trigger, may be null)
 */
export async function checkAndTriggerDeploy(
  websiteId: string,
  updatedAt: string,
  lastBuildAt: string | null,
): Promise<boolean> {
  const hookUrl = getHookUrl();
  if (!hookUrl) return false;

  const updatedTime = new Date(updatedAt).getTime();
  const buildTime = lastBuildAt ? new Date(lastBuildAt).getTime() : 0;
  const now = Date.now();

  // Condition 1: Content must have changed since last build
  if (buildTime >= updatedTime) return false;

  // Condition 2: Last build must be >2 hours ago (throttle)
  if (now - buildTime < THROTTLE_MS) return false;

  // Both conditions met — trigger build
  return fireWebhook(hookUrl, websiteId);
}
