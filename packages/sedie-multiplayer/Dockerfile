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
RUN yarn install --frozen-lockfile --verbose

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
# Copy sentry config files from shared package
COPY packages/shared/src/sentry-config/sentry.client.config.js packages/sedie-multiplayer/sentry.client.config.js
COPY packages/shared/src/sentry-config/sentry.edge.config.js packages/sedie-multiplayer/sentry.edge.config.js
COPY packages/shared/src/sentry-config/sentry.server.config.js packages/sedie-multiplayer/sentry.server.config.js
COPY packages/sedie-multiplayer/custom-server.js packages/sedie-multiplayer/custom-server.js
COPY packages/sedie-multiplayer/configs.json packages/sedie-multiplayer/configs.json
COPY packages/sedie-multiplayer/game-settings.json packages/sedie-multiplayer/game-settings.json

# Copy shared fonts from root directory
COPY packages/shared/public/static/fonts packages/sedie-multiplayer/public/static/fonts

# Copy source code
COPY packages/sedie-multiplayer/src packages/sedie-multiplayer/src
COPY packages/sedie-multiplayer/public packages/sedie-multiplayer/public
COPY packages/sedie-multiplayer/configs packages/sedie-multiplayer/configs

# Copy shared package
COPY packages/shared packages/shared

# Build sedie-multiplayer app
WORKDIR /app/packages/sedie-multiplayer

# Set Next.js basePath and game ID for production deployment
ENV NEXT_PUBLIC_BASE_PATH=/game-148
ENV NEXT_PUBLIC_DEFAULT_GAME_ID=148

# Obfuscate deployment configs and build
RUN yarn obfuscator-config-file
RUN yarn build:standalone

FROM base AS runner

WORKDIR /app
ENV NODE_ENV=production

# Ensure environment variables are available in the runner stage
ENV NEXT_PUBLIC_BASE_PATH=/game-148
ENV NEXT_PUBLIC_DEFAULT_GAME_ID=148

RUN addgroup --system --gid 1001 nodejs  \
     && adduser --system --uid 1001 nextjs \
     && mkdir -p src packages/shared/configs

# Copy the built app and required assets
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/next.config.js ./next.config.js
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/game-settings.json ./game-settings.json
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/configs.json ./configs.json
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/custom-server.js ./custom-server.js
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/src/image-loader.js ./src/image-loader.js
COPY --from=builder --chown=nextjs:nodejs /app/packages/sedie-multiplayer/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/packages/shared/configs/custom-server.js ./packages/shared/configs/custom-server.js

# Ensure proper permissions for the .next directory
RUN chown -R nextjs:nodejs .next

USER nextjs

EXPOSE 5000
ENV PORT=5000
ENV HOSTNAME=0.0.0.0

CMD ["sh", "-c", "node custom-server.js"]