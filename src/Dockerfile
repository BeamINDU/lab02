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

# Copy the rest of the source code from the src folder
COPY . .

# Build the Next.js application (optional for development, you can remove this if not needed)
RUN npm run build

# Expose the port Next.js runs on (default is 3000)
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "run", "dev"]

# # Step 1: Build the React app
# FROM node:22-alpine AS build

# # Set working directory
# WORKDIR /app
# # Set environment variable to disable ESLint
# ENV NEXT_PUBLIC_DISABLE_ESLINT=true

# # Copy package.json and package-lock.json
# COPY ../package-lock.json ./
# COPY ../package.json ./
# COPY ../tsconfig*.json ./
# COPY ../tailwind.config.ts ./
# COPY ../next.config.ts ./
# COPY ../.eslintrc.json ./ 
# COPY ../postcss.config.mjs ./  
# COPY ../fontawesome.js ./  

# # Install dependencies
# RUN npm install --legacy-peer-deps

# # Copy the rest of the application
# COPY ./src/app /src/app
# COPY ./src/styles /src/styles
# # Build the app
# RUN npm run build

# # Step 2: Serve the app with NGINX
# FROM nginx:alpine

# # Copy built files from the previous stage
# COPY --from=build /src/app/ /usr/share/nginx/html


# # Expose port 80
# EXPOSE 80

# # Start NGINX server
# CMD ["nginx", "-g", "daemon off;"]
