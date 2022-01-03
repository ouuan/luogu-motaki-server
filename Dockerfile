FROM node:16

WORKDIR /app

RUN ln -s -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm i

COPY . .
RUN pnpm build

EXPOSE 15762
CMD ["node", "."]
