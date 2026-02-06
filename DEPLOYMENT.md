# Deployment Guide for Swasth Voice Care

This guide explains how to deploy your **Swasth Voice Care** application to the web. The recommended platform is **Vercel** due to its seamless integration with Vite and React, but **Netlify** is also a great choice.

## Prerequisites

1.  **GitHub Repository**: Ensure your project is pushed to a GitHub repository.
2.  **Supabase Project**: You must have your Supabase URL and Anon Key ready.

---

## Option 1: Deploy to Vercel (Recommended)

Vercel is optimized for frontend frameworks and offers the easiest deployment experience.

### Steps:

1.  **Create a Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up (login with GitHub is easiest).
2.  **Import Project**:
    *   Click **"Add New..."** -> **"Project"**.
    *   Select your GitHub repository from the list.
3.  **Configure Project**:
    *   **Framework Preset**: It should automatically detect **Vite**. If not, select it manually.
    *   **Root Directory**: Ensure it points to the root of your project (where `package.json` is).
4.  **Environment Variables**:
    *   Expand the **"Environment Variables"** section.
    *   Add the following variables (copy them from your local `.env` file):
        *   `VITE_SUPABASE_URL`: Your Supabase Project URL.
        *   `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
5.  **Deploy**:
    *   Click **"Deploy"**.
    *   Wait for the build to finish. Vercel will install dependencies and build your app.
6.  **Done!**: faster than you can say "Swasth", your app will be live on a `*.vercel.app` domain.

### Troubleshooting Vercel Refreshes
If you encounter 404 errors when refreshing pages (e.g., `/dashboard`), you may need to add a `vercel.json` file to the root of your project:

**vercel.json**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Option 2: Deploy to Netlify

### Steps:

1.  **Create a Netlify Account**: Go to [netlify.com](https://netlify.com).
2.  **Add New Site**:
    *   Click **"Add new site"** -> **"Import from an existing project"**.
    *   Connect to GitHub and select your repository.
3.  **Build Settings**:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
4.  **Environment Variables**:
    *   Click **"Show advanced"** or go to **"Site settings"** -> **"Environment variables"** after setup.
    *   Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5.  **Deploy**: Click **"Deploy site"**.

### Troubleshooting Netlify Refreshes
Create a `_redirects` file in your `public` folder with the following content to handle SPA routing:

**public/_redirects**
```
/*  /index.html  200
```

---

## Important Note on Supabase
Ensure your Supabase project's **Site URL** (in Authentication -> URL Configuration) matches your new deployment URL (e.g., `https://your-app.vercel.app`) so that redirects after login work correctly.
