# SASA_ASYNC_THUMBNAILS_V27 (was SASA_CHILD_PIN_V20 / SASA_RATE_LIMIT_V20)
#
# Rebased FROM v14, the tag actually running when this was built, so the diff
# under review stays the source diff. resumable-uploads.js is the added file.
#
# Built FROM the image that was already running, so the Node runtime and the
# existing node_modules stay byte-identical and the reviewable change is the
# source diff plus one added dependency. express-rate-limit is installed on top
# because the API previously had no rate limiting at all — see the comment above
# authLimiter in server.js for why that mattered for a four-digit child PIN.
FROM 192.168.0.101:5050/saratube-backend:v14

WORKDIR /app

USER root
# SASA_VIDEO_THUMBNAILS_V21 — ffmpeg/ffprobe are required to extract a real
# frame from each uploaded video. ~1 extra layer; no other runtime change.
RUN apk add --no-cache ffmpeg

RUN npm install --no-audit --no-fund --omit=dev express-rate-limit@^7.4.0 \
  && chown -R node:node /app/node_modules

COPY package.json /app/package.json
COPY server.js /app/server.js
COPY thumbnails.js /app/thumbnails.js
COPY thumbnail-worker.js /app/thumbnail-worker.js
COPY resumable-uploads.js /app/resumable-uploads.js
COPY api-numbers.js /app/api-numbers.js
COPY media-delivery.js /app/media-delivery.js
COPY images.js /app/images.js
COPY migrations /app/migrations
COPY backfill-thumbnails.js /app/backfill-thumbnails.js

USER node
