FROM node:22-alpine

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY server.js ./

ENV NODE_ENV=production
EXPOSE 3000

# The base image ships an unprivileged `node` user. The app binds an
# unprivileged port and writes nothing, so there is no reason to run as root.
USER node

CMD ["node", "server.js"]
