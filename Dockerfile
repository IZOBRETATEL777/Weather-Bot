# Use Bun as the base image
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json bun.lock ./
RUN bun install

# Copy the rest of the application
COPY . .

# Expose the application port
EXPOSE 3000

# Start the Bun server
CMD ["bun", "run", "index.ts"]

