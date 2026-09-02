FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm \
    npm config set fetch-retries 6 && \
    npm config set fetch-retry-mintimeout 20000 && \
    npm config set fetch-retry-maxtimeout 120000 && \
    npm config set fetch-timeout 300000 && \
    for attempt in 1 2 3 4 5; do \
      echo "npm ci attempt ${attempt} of 5"; \
      npm ci --prefer-offline --no-audit --no-fund && break; \
      if [ "${attempt}" = "5" ]; then \
        echo "npm ci failed after 5 attempts"; \
        exit 1; \
      fi; \
      sleep $((attempt * 15)); \
    done

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN test -n "$VITE_API_BASE_URL" || \
    (echo "ERROR: VITE_API_BASE_URL is required" && exit 1)

RUN npm run build


FROM node:22-alpine AS runner

WORKDIR /app

# The image-scan gate (Trivy, HIGH/CRITICAL, --ignore-unfixed) blocks both CI
# and CD while node:22-alpine still ships openssl 3.5.7-r0, which carries
# CVE-2026-14456. Alpine v3.24/main already publishes the fixed 3.5.8-r0, so
# the OS packages are upgraded here instead of the finding being suppressed.
# Keep this in the runner stage: it is the only stage that ships, and it is
# what the scanner inspects.
RUN apk --no-cache upgrade libssl3 libcrypto3

RUN rm -rf \
    /usr/local/lib/node_modules/npm \
    /usr/local/lib/node_modules/corepack \
    /opt/yarn-v1.22.22 \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/corepack \
    /usr/local/bin/yarn \
    /usr/local/bin/yarnpkg

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.output ./.output

EXPOSE 3000

USER node

CMD ["node", ".output/server/index.mjs"]
