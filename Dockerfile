# PWS deployment image for the ParaLab web application.
FROM node:22-bookworm-slim AS build

WORKDIR /app
ENV npm_config_loglevel=warn \
    npm_config_fetch_retries=5 \
    npm_config_fetch_retry_mintimeout=20000 \
    npm_config_fetch_retry_maxtimeout=120000 \
    npm_config_fetch_timeout=300000

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .
# Keep a literal replacement token in the browser/server bundles. The runtime
# entrypoint replaces it with the public Cloudflare Tunnel API origin.
ENV VITE_MODEL_API_BASE=__PARALAB_API_BASE__
RUN npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/.output ./.output
COPY deploy/pws-entrypoint.sh /usr/local/bin/pws-entrypoint

RUN chmod 0555 /usr/local/bin/pws-entrypoint \
    && useradd --system --uid 10001 --create-home appuser \
    && chown -R appuser:appuser /app

USER appuser
EXPOSE 80
ENTRYPOINT ["/usr/local/bin/pws-entrypoint"]
