FROM node:20-alpine AS builder

WORKDIR /home/node/app

# Copy package.json and yarn.lock separately to leverage Docker layer caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install \
  --prefer-offline \
  --frozen-lockfile \
  --non-interactive \
  --production=false

# Copy the rest of the application code
COPY . .

RUN yarn build

RUN rm -rf node_modules && \
  NODE_ENV=production yarn install \
  --prefer-offline \
  --pure-lockfile \
  --non-interactive \
  --production=true

FROM node:18-alpine

# Install ffmpeg
RUN apk add --no-cache ffmpeg

ADD https://github.com/Yelp/dumb-init/releases/download/v1.2.2/dumb-init_1.2.2_amd64 /usr/local/bin/dumb-init

WORKDIR /home/node/app

RUN chown -R node:node /home/node/app /usr/local/ && \
  chmod 0755 /home/node/app -R && \
  chmod +x /usr/local/bin/dumb-init

USER node:node

COPY --from=builder /home/node/app/package.json  ./package.json
COPY --from=builder /home/node/app/node_modules  ./node_modules
COPY --from=builder /home/node/app/dist  ./dist

# Ensure the storage/uploads directory exists and set the correct permissions
RUN mkdir -p /home/node/app/uploads && \
  chown -R node:node /home/node/app/uploads

EXPOSE 3000

CMD [ "/usr/local/bin/dumb-init", "yarn", "start" ]