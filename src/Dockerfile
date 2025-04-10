# Step 1: Build stage
FROM node:22-alpine AS builder

# Set working directory inside container
WORKDIR /app

# Copy the package.json and package-lock.json from the root of the project
COPY ../package*.json ./
COPY ../tsconfig*.json ./
COPY ../tailwind.config.ts ./
COPY ../next.config.ts ./
COPY ../.eslintrc.json ./ 
COPY ../postcss.config.mjs ./  
COPY ../fontawesome.js ./ 

# Install dependencies
RUN npm install --legacy-peer-deps

# Add this to your Dockerfile
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && ln -s /usr/bin/python3 /usr/bin/python

# Copy the rest of the source code from the src folder
COPY . .

# Build the Next.js application (optional for development, you can remove this if not needed)
RUN npm run build

# Expose the port Next.js runs on (default is 3000)
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "dev"]
