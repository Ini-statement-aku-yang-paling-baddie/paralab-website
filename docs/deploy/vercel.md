# Vercel deployment

ParaLab's browser UI is deployed to Vercel. The model services are not deployed
there: F1, F2, F3, F4, and F5 remain behind one public API gateway on the
laptop hosting the models.

## Project settings

Import the GitHub repository and select the `master` branch. Vercel detects the
Lovable/TanStack Start application without a Dockerfile or a manual framework
override.

Set this environment variable for **Production** and **Preview**:

```text
VITE_MODEL_API_BASE=https://<public-api-gateway>
```

The value must be the public HTTPS gateway origin without a trailing slash. It
is public browser configuration, so it must never contain credentials or API
keys. Do not use `localhost`.

## Tunnel boundary

A Cloudflare Quick Tunnel is sufficient for a temporary demo but produces a new
URL when restarted. Each new Quick Tunnel URL requires updating
`VITE_MODEL_API_BASE` and redeploying Vercel. A named Cloudflare Tunnel with a
user-owned domain is required for a stable portfolio API URL.

## Verification

1. Confirm the Vercel deployment URL returns HTTP 200.
2. Confirm the browser's API requests use the configured HTTPS gateway, not
   `/api` or `localhost`.
3. Verify CORS and one request each to the F1, F2, F3, F4, and F5 routes from
   the public frontend origin.
