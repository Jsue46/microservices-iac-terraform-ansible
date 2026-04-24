FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci --omit=dev
COPY src ./src
ENV HOST=0.0.0.0
ENV PORT=3002
EXPOSE 3002
CMD ["node", "--experimental-strip-types", "src/server.ts"]