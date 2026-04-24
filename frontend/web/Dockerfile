FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./
COPY apps/web/package.json ./apps/web/package.json
COPY apps/web ./apps/web

RUN npm install
RUN npm run build -w @mentico/web

EXPOSE 3000

CMD ["npm", "run", "start", "-w", "@mentico/web"]
