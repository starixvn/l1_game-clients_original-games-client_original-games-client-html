FROM hub.lumigame.com/base/node:24-alpine-25h2 AS base

FROM base AS deps
WORKDIR /app

ENV YARN_CACHE_FOLDER=/root/.yarn

RUN --mount=type=cache,target=$YARN_CACHE_FOLDER \
     yarn cache dir && yarn cache list

# Install monorepo dependencies (workspaces)
COPY package.json yarn.lock ./
COPY packages/shared/package.json packages/shared/package.json
COPY packages/sedie/package.json packages/sedie/package.json
COPY packages/baccarat/package.json packages/baccarat/package.json
RUN --mount=type=cache,target=$YARN_CACHE_FOLDER \
     yarn install --frozen-lockfile --verbose

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Baccarat app
WORKDIR /app/packages/baccarat
# Obfuscate deployment configs (generates configs/*/obfuscations -> c/*)
RUN yarn obfuscator-config-file
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
RUN yarn build:standalone

FROM base AS runner

WORKDIR /app
ENV NODE_ENV production

# Optionally expose base path at runtime for any custom logic
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH

RUN addgroup --system --gid 1001 nodejs  \
     && adduser --system --uid 1001 nextjs

# Copy standalone server and required assets
COPY --from=builder --chown=nextjs:nodejs /app/packages/baccarat/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/baccarat/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/packages/baccarat/public ./public

USER nextjs

EXPOSE 5000
ENV PORT 5000
CMD HOSTNAME="0.0.0.0" node server.js


