FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN test -n "$VITE_API_BASE_URL" || \
    (echo "ERROR: VITE_API_BASE_URL is required" && exit 1)

RUN npm run build


FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.output ./.output

# The runtime only needs Node.js. Remove package managers and their
# bundled dependencies to reduce the production attack surface.
RUN rm -rf     /usr/local/lib/node_modules/npm     /usr/local/lib/node_modules/corepack     /opt/yarn-*     /usr/local/bin/npm     /usr/local/bin/npx     /usr/local/bin/corepack     /usr/local/bin/yarn     /usr/local/bin/yarnpkg

EXPOSE 3000

USER node

CMD ["node", ".output/server/index.mjs"]
