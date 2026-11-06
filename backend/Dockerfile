ARG NODE_VERSION=22.17.1

FROM node:${NODE_VERSION}-alpine as base

WORKDIR /app

COPY package*.json .

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "run","start"]
