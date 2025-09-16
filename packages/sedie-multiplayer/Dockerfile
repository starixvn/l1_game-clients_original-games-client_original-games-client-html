FROM hub.lumigame.com/base/node:24-alpine-25h2 AS base

FROM base AS deps
WORKDIR /app

ENV YARN_CACHE_FOLDER=/root/.yarn

RUN --mount=type=cache,target=$YARN_CACHE_FOLDER \
     yarn cache dir && yarn cache list

# Copy only the necessary package files for sedie-multiplayer
COPY package.json yarn.lock ./
COPY packages/shared/package.json packages/shared/package.json
COPY packages/sedie-multiplayer/package.json packages/sedie-multiplayer/package.json
RUN --mount=type=cache,target=$YARN_CACHE_FOLDER \
     yarn install --frozen-lockfile --verbose

FROM base AS builder
WORKDIR /app

# Copy the installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/yarn.lock ./yarn.lock

# Copy root tsconfig files that sedie-multiplayer extends
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.node.json ./tsconfig.node.json

# Copy only sedie-multiplayer-specific files
COPY packages/sedie-multiplayer/package.json packages/sedie-multiplayer/package.json
COPY packages/sedie-multiplayer/next.config.js packages/sedie-multiplayer/next.config.js
COPY packages/sedie-multiplayer/tsconfig.json packages/sedie-multiplayer/tsconfig.json
COPY packages/sedie-multiplayer/tailwind.config.js packages/sedie-multiplayer/tailwind.config.js
COPY packages/sedie-multiplayer/postcss.config.js packages/sedie-multiplayer/postcss.config.js
COPY packages/sedie-multiplayer/sentry.client.config.js packages/sedie-multiplayer/sentry.client.config.js
COPY packages/sedie-multiplayer/sentry.edge.config.js packages/sedie-multiplayer/sentry.edge.config.js
COPY packages/sedie-multiplayer/sentry.server.config.js packages/sedie-multiplayer/sentry.server.config.js
COPY packages/sedie-multiplayer/configs.json packages/sedie-multiplayer/configs.json
COPY packages/sedie-multiplayer/game-settings.json packages/sedie-multiplayer/game-settings.json

# Copy source code
COPY packages/sedie-multiplayer/src packages/sedie-multiplayer/src
COPY packages/sedie-multiplayer/public packages/sedie-multiplayer/public
COPY packages/sedie-multiplayer/configs packages/sedie-multiplayer/configs

# Copy shared package
COPY packages/shared packages/shared

# Build sedie-multiplayer app
WORKDIR /app/packages/sedie-multiplayer

# Allow configuring Next.js basePath/assetPrefix at build time
ARG NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_DEFAULT_GAME_ID=148
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_DEFAULT_GAME_ID=$NEXT_PUBLIC_DEFAULT_GAME_ID


# Obfuscate deployment configs and build
RUN yarn obfuscator-config-file
RUN yarn build:standalone

FROM base AS runner

WORKDIR /app
ENV NODE_ENV=production

# Optionally expose base path at runtime for any custom logic
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

RUN addgroup --system --gid 1001 nodejs  \
     && adduser --system --uid 1001 nextjs

# Copy the built app and required assets
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/next.config.js ./next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/game-settings.json ./game-settings.json
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/configs.json ./configs.json

# Ensure proper permissions for the .next directory
RUN chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 5000
ENV PORT=5000
ENV HOSTNAME=0.0.0.0

CMD ["./node_modules/.bin/next", "start", "-p", "5000"]