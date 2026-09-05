FROM node:alpine AS development

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json nest-cli.json ./
COPY apps/payment/package.json ./apps/payment/

RUN npm install -g pnpm@9
RUN pnpm install --frozen-lockfile

COPY apps/payment apps/payment
COPY libs libs

RUN pnpm run build payment

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
