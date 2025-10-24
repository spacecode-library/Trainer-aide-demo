# Deploying Trainer Aide to Netlify

## Configuration Added

I've configured the app for static export to work with Netlify:

### 1. `netlify.toml`
- Build command: `npm run build`
- Publish directory: `out`
- Redirects configured for client-side routing

### 2. `next.config.ts`
- Static export enabled: `output: 'export'`
- Image optimization disabled (required for static export)

### 3. Fixed `useSearchParams` Issue
- Wrapped in Suspense boundary for static export compatibility
- Pre-filling client from calendar now works

## Deploy Steps

### Option 1: Push to Git
```bash
git add .
git commit -m "Configure for Netlify static export"
git push
```

Netlify will automatically rebuild and deploy.

### Option 2: Manual Deploy
1. Build locally: `npm run build`
2. Upload the `out` folder to Netlify

## What This Fixes

- ✅ 404 errors on page refresh
- ✅ Client-side routing works
- ✅ All pages accessible
- ✅ Calendar integration with session creation
- ✅ Static export compatible

## Testing Locally

```bash
npm run build
npx serve@latest out
```

Then visit http://localhost:3000

## Troubleshooting

If you still get 404s:
1. Check Netlify build logs
2. Verify `out` folder was published
3. Ensure redirects are working (should see in deploy log)

The app is now fully configured for Netlify deployment!
