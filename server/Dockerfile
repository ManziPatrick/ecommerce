# Node.js/Prisma image
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Build the TypeScript code
RUN npm run build



ENV HOST=::
ENV PORT=5000

EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run seed && npm start"]