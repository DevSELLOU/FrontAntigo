# Use a slim Node.js image for the build stage
FROM node:22.17.1 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci
COPY .env.production ./.env.production

COPY . .

# Build your Next.js application
# Ensure NEXT_PUBLIC_API_URL is correctly set during build if needed
# It's better to provide this as an env var to docker compose
RUN npm run build

# Use a smaller, production-ready Node.js image for the final stage
FROM node:22.17.1

WORKDIR /app

# Copy built files and dependencies
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
# next.config.mjs is read at RUNTIME (next start), not baked into .next at build time — without
# this, `images.remotePatterns` is empty in the running container, and next/image rejects every
# remote URL with "url parameter is not allowed" no matter what the repo's config says. This is
# why the site-wide broken-image bug survived a build that type-checked and tested clean: nothing
# short of hitting the deployed container's /_next/image endpoint could have caught it.
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Expose the port your Next.js app will listen on (default 3000, but we'll use 3001)
EXPOSE 3001

# Command to run the application in production mode
CMD ["npm", "start"]
