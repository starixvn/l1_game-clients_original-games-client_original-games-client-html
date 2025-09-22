FROM hub.lumigame.com/base/node:24-alpine-25h2 AS base

FROM base AS deps
WORKDIR /app

ENV YARN_CACHE_FOLDER=/root/.yarn

RUN --mount=type=cache,target=$YARN_CACHE_FOLDER \
     yarn cache dir && yarn cache list

# Copy only the necessary package files for baccarat-multiplayer
COPY package.json yarn.lock ./
COPY packages/shared/package.json packages/shared/package.json
COPY packages/baccarat-multiplayer/package.json packages/baccarat-multiplayer/package.json
RUN --mount=type=cache,target=$YARN_CACHE_FOLDER \
     yarn install --frozen-lockfile --verbose

FROM base AS builder
WORKDIR /app

# Copy the installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/yarn.lock ./yarn.lock

# Copy root tsconfig files that baccarat-multiplayer extends
COPY tsconfig.json ./tsconfig.json
COPY tsconfig.node.json ./tsconfig.node.json

# Copy only baccarat-multiplayer-specific files
COPY packages/baccarat-multiplayer/package.json packages/baccarat-multiplayer/package.json
COPY packages/baccarat-multiplayer/next.config.js packages/baccarat-multiplayer/next.config.js
COPY packages/baccarat-multiplayer/tsconfig.json packages/baccarat-multiplayer/tsconfig.json
COPY packages/baccarat-multiplayer/tailwind.config.js packages/baccarat-multiplayer/tailwind.config.js
COPY packages/baccarat-multiplayer/postcss.config.js packages/baccarat-multiplayer/postcss.config.js
# Copy sentry config files from shared package
COPY packages/shared/src/sentry-config/sentry.client.config.js packages/baccarat-multiplayer/sentry.client.config.js
COPY packages/shared/src/sentry-config/sentry.edge.config.js packages/baccarat-multiplayer/sentry.edge.config.js
COPY packages/shared/src/sentry-config/sentry.server.config.js packages/baccarat-multiplayer/sentry.server.config.js
COPY packages/baccarat-multiplayer/custom-server.js packages/baccarat-multiplayer/custom-server.js
COPY packages/baccarat-multiplayer/configs.json packages/baccarat-multiplayer/configs.json
COPY packages/baccarat-multiplayer/game-settings.json packages/baccarat-multiplayer/game-settings.json

# Copy source code
COPY packages/baccarat-multiplayer/src packages/baccarat-multiplayer/src
COPY packages/baccarat-multiplayer/public packages/baccarat-multiplayer/public
COPY packages/baccarat-multiplayer/configs packages/baccarat-multiplayer/configs

# Copy shared package
COPY packages/shared packages/shared

# Build baccarat-multiplayer app
WORKDIR /app/packages/baccarat-multiplayer

# Set Next.js basePath and game ID for production deployment
ENV NEXT_PUBLIC_BASE_PATH=/game-150
ENV NEXT_PUBLIC_DEFAULT_GAME_ID=150
ENV NEXT_PUBLIC_GAME_PACKAGE=baccarat-multiplayer

# Obfuscate deployment configs and build
RUN yarn obfuscator-config-file
RUN yarn build:standalone

FROM base AS runner

WORKDIR /app
ENV NODE_ENV=production

# Ensure base path is set for runtime
ENV NEXT_PUBLIC_BASE_PATH=/game-150

RUN addgroup --system --gid 1001 nodejs  \
     && adduser --system --uid 1001 nextjs

# Create src directory for image loader
RUN mkdir -p src

# Copy the built app and required assets
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages/baccarat-multiplayer/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/packages/baccarat-multiplayer/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/packages/baccarat-multiplayer/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/packages/baccarat-multiplayer/next.config.js ./next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/packages/baccarat-multiplayer/game-settings.json ./game-settings.json
COPY --from=builder --chown=nextjs:nodejs /app/packages/baccarat-multiplayer/configs.json ./configs.json
COPY --from=builder --chown=nextjs:nodejs /app/packages/baccarat-multiplayer/custom-server.js ./custom-server.js
COPY --from=builder --chown=nextjs:nodejs /app/packages/baccarat-multiplayer/src/image-loader.js ./src/image-loader.js
COPY --from=builder --chown=nextjs:nodejs /app/packages/baccarat-multiplayer/.next/static ./.next/static

# Ensure proper permissions for the .next directory
RUN chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 5000
ENV PORT=5000
ENV HOSTNAME=0.0.0.0

CMD ["sh", "-c", "PORT=5000 node custom-server.js"]