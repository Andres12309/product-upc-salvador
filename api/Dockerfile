FROM node:22-alpine
WORKDIR /app
ENV DATABASE_URL=postgresql://prueba:prueba123@db:5432/productos_upc
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src/load-env.ts ./src/load-env.ts
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build
EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
