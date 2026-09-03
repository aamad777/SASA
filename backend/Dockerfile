# SASA_CHILD_PIN_V20 / SASA_RATE_LIMIT_V20
#
# Built FROM the image that was already running, so the Node runtime and the
# existing node_modules stay byte-identical and the reviewable change is the
# source diff plus one added dependency. express-rate-limit is installed on top
# because the API previously had no rate limiting at all — see the comment above
# authLimiter in server.js for why that mattered for a four-digit child PIN.
FROM 192.168.0.101:5050/saratube-backend:v5

WORKDIR /app

USER root
RUN npm install --no-audit --no-fund --omit=dev express-rate-limit@^7.4.0 \
  && chown -R node:node /app/node_modules

COPY package.json /app/package.json
COPY server.js /app/server.js

USER node
