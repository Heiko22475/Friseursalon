# Vercel & Multi-Tenant Setup Guide

This guide explains how to configure the application to host multiple websites (Multi-Tenant SaaS) on Vercel using Supabase.

## 1. Database Configuration

You need to map domains to your customers in the Supabase database.

1.  **Run SQL Migration**:
    Execute the contents of `supabase-domains.sql` in your Supabase SQL Editor. This adds a `domain` column to the `websites` table.

2.  **Assign Domains**:
    Update your `websites` table to map specific customers to their domains.
    ```sql
    -- Example for production
    UPDATE websites SET domain = 'haarfein.de' WHERE customer_id = '123456';
    
    -- Example for local development
    UPDATE websites SET domain = 'localhost' WHERE customer_id = '000000';
    ```

## 2. Application Logic (How it works)

The application (`src/hooks/useCustomerId.ts`) now determines which content to show based on the browser's hostname:

*   **Production Lookup**: Checks `window.location.hostname` against the `domain` column in your database.
*   **Localhost Fallback**: If running locally, it looks for a 'localhost' entry or defaults to the first available user.
*   **No Match**: If a domain points to the app but isn't configured in the DB, it shows a "Webseite nicht gefunden" error.
*   **SuperAdmin**: The `/superadmin` routes remain accessible even if no specific customer domain is matched (e.g., when accessing via your main SaaS domain).

## 3. Vercel Configuration

To host multiple domains on a single Vercel deployment:

1.  **Connect Repo**: Connect your GitHub repository to a new Vercel Project.
2.  **Environment Variables**: Add your Supabase credentials in Vercel (Settings -> Environment Variables):
    *   `VITE_SUPABASE_URL`
    *   `VITE_SUPABASE_ANON_KEY`
3.  **Add Domains**:
    *   Go to **Settings -> Domains** in your Vercel Project.
    *   Add every customer domain here (e.g., `haarfein.de`, `mysalon.com`, `admin.yourservice.com`).
4.  **DNS Setup**:
    *   Vercel will provide A-Records (76.76.21.21) or CNAME records.
    *   The customer must configure their DNS provider to point their domain to these Vercel records.

## 4. Routing Behavior

*   **`haarfein.de`**
    *   App checks DB for domain `haarfein.de` -> Finds Customer ID `123456`.
    *   Loads Website Content for `123456`.
*   **`haarfein.de/admin`**
    *   Loads Website Content for `123456`.
    *   React Router shows Login/Admin dashboard for that specific customer.
*   **`yourservice.com` (Main SaaS Domain)**
    *   If mapped to a "Landing Page" customer in DB -> Shows Landing Page.
    *   If NOT mapped -> Shows "Not Found".
*   **`yourservice.com/superadmin`**
    *   Loads SuperAdmin Dashboard (independent of customer context).
