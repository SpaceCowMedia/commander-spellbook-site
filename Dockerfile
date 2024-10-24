FROM node:20-alpine AS base

# If running docker build locally uncomment the following lines and run
#    docker build --no-cache --build-arg github_token=<yourGitHubToken> -t spellbook-client:latest .

#ARG github_token
#ENV GITHUB_TOKEN=$github_token
#RUN echo registry=https://registry.npmjs.org/ >> ~/.npmrc
#RUN echo @spacecowmedia:registry=https://npm.pkg.github.com/ >> ~/.npmrc
#RUN echo //npm.pkg.github.com/:_authToken=$GITHUB_TOKEN >> ~/.npmrc

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat \
  build-base \
  g++ \
  cairo-dev \
  jpeg-dev \
  pango-dev \
  bash \
  imagemagick
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 101; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
ENV NEXT_TELEMETRY_DISABLED=1

ARG build_type=prod
ENV BUILD_TYPE=$build_type
RUN yarn install
RUN yarn build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner

RUN apk add --no-cache cairo pango jpeg

WORKDIR /app

ARG build_type=prod
ENV BUILD_TYPE=$build_type
ENV NODE_ENV=production

ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
# set hostname to localhost
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
