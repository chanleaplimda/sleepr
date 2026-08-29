FROM node:alpine AS development

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm@9
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm@9
RUN pnpm install --prod --frozen-lockfile

COPY --from=development /usr/src/app/dist ./dist
CMD ["node", "dist/apps/payment/main.js"]



