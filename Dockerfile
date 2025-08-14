FROM node:24.5.0-alpine3.22 AS base

FROM base AS dependency-installer
WORKDIR /opt/server/deps
COPY package.json yarn.lock ./
RUN yarn install --immutable

FROM base AS builder
WORKDIR /opt/server/build
COPY --from=dependency-installer /opt/server/deps/node_modules ./node_modules
COPY . .
RUN yarn build && yarn install --production

FROM base AS runner
WORKDIR /opt/server
RUN apk update \
  && apk add --no-cache tini curl \
  && chown -R node:node /opt/server
COPY --from=builder --chown=node:node /opt/server/build/node_modules ./node_modules
COPY --from=builder --chown=node:node /opt/server/build/dist ./dist
COPY --from=builder --chown=node:node /opt/server/build/package.json ./
USER node
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
ARG PORT=3000
ENV PORT=$PORT
EXPOSE $PORT
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "npx typeorm migration:run -d dist/data-source.js && node dist/src/main.js"]
