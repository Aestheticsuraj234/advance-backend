# Docker Compose vs Dockerfile - Key Differences

## Overview

| Aspect | Dockerfile | Docker Compose (docker-compose.yml) |
|--------|------------|-------------------------------------|
| **Purpose** | Builds custom Docker images | Orchestrates multiple containers |
| **Scope** | Single container/image | Multi-container applications |
| **File Format** | Text file with build instructions | YAML configuration file |
| **When to Use** | Creating custom applications | Running existing images together |

## Dockerfile

### What is Dockerfile?
A **Dockerfile** is a text file containing step-by-step instructions to build a custom Docker image from scratch.

### Purpose
- **Build custom images** for your applications
- **Define the environment** where your app will run
- **Package your application** with all its dependencies

### Example Dockerfile
```dockerfile
# Use Node.js base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Define startup command
CMD ["npm", "start"]
```

### Key Commands
- `FROM` - Base image to start from
- `COPY/ADD` - Copy files into the image
- `RUN` - Execute commands during build
- `CMD/ENTRYPOINT` - Command to run when container starts
- `EXPOSE` - Document which ports the app uses
- `ENV` - Set environment variables
- `WORKDIR` - Set working directory

### When to Use Dockerfile
- Creating custom applications (Node.js, Python, Java apps)
- Need to install specific software or dependencies
- Want to optimize image size and laye