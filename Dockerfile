FROM hub.lumigame.com/base/node:24-alpine-25h2 AS base

FROM base AS deps
WORKDIR /app

ENV YARN_CACHE_FOLDER=/root/.yarn

RUN --mount=type=cache,target=$YARN_CACHE_FOLDER \
     yarn cache dir && yarn cache list

COPY package.json yarn.lock ./
RUN --mount=type=cache,target=$YARN_CACHE_FOLDER \
     yarn install --frozen-lockfile --verbose

#RUN npx mod-pruner prune --force
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json yarn.lock sentry.client.config.js sentry.edge.config.js sentry.server.config.js tsconfig.json tsconfig.node.json configs.json game-settings.json next.config.js tailwind.config.js postcss.config.js ./
COPY configs ./configs
COPY public ./public
COPY configs/missing-configuration.js ./public/c.js
COPY src ./src
COPY scripts ./scripts

# Allow configuring Next.js basePath/assetPrefix at build time
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

# Build standalone version with all assets included
# This builds the app and copies static assets to standalone directory
RUN yarn build && yarn copy-standalone-assets

FROM base AS runner

WORKDIR /app
ENV NODE_ENV production

# Optionally expose base path at runtime for any custom logic
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

RUN addgroup --system --gid 1001 nodejs  \
     && adduser --system --uid 1001 nextjs

# Copy the entire standalone directory which now includes all assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Ensure proper permissions for the .next directory
RUN chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 5000
ENV PORT 5000
CMD HOSTNAME="0.0.0.0" node server.js