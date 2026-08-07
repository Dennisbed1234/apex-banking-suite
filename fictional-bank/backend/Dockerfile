FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (use npm ci for reproducible installs)
COPY package*.json ./
RUN npm ci

# Copy source and generate prisma client, build project
COPY . .
RUN npx prisma generate
RUN npm run build

# Remove devDependencies to keep node_modules production-only
RUN npm prune --production

# Runtime image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy package metadata first
COPY package*.json ./

# Copy production artifacts from build stage
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

EXPOSE 4000
CMD ["node", "dist/server.js"]
