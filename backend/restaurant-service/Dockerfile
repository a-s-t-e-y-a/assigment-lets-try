FROM node:20-alpine

RUN apk add --no-cache wget

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3002

CMD ["node", "server.js"]
