# --- Use the official Playwright base image (best practice)
FROM mcr.microsoft.com/playwright:v1.44.0-jammy AS base

# --- Set working directory
WORKDIR /app

# --- Copy only package files first (better caching)
COPY package*.json ./

# --- Install dependencies (Playwright browsers already included in this image)
RUN npm install

# --- Copy the rest of the source code
COPY . .

# --- Build Next.js
RUN npm run build

# --- Expose app port
EXPOSE 3000

# --- Run the production server
CMD ["npm", "start"]
