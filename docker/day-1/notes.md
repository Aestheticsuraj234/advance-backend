# Docker Complete Notes

## What is Docker?

Docker is a platform that uses containerization technology to package applications and their dependencies into lightweight, portable containers. These containers can run consistently across different environments - from development laptops to production servers.

**Key Concepts:**
- **Container**: A lightweight, standalone package that includes everything needed to run an application
- **Image**: A read-only template used to create containers
- **Dockerfile**: A text file with instructions to build Docker images

## Docker vs Virtual Machines

### Why Docker over VMs?

| Docker Containers | Virtual Machines |
|------------------|------------------|
| ✅ Lightweight (MBs) | ❌ Heavy (GBs) |
| ✅ Fast startup (seconds) | ❌ Slow startup (minutes) |
| ✅ Share host OS kernel | ❌ Each VM needs full OS |
| ✅ Better resource utilization | ❌ Resource overhead |
| ✅ Easy to scale | ❌ Complex scaling |

**Benefits of Docker:**
- Consistent environments across development, testing, and production
- Faster deployment and scaling
- Better resource efficiency
- Simplified dependency management
- Microservices architecture support

## Installation

### Docker Desktop
- **Windows/Mac**: Download from [docker.com](https://docker.com)
- Provides GUI interface with container management
- Includes Docker CLI automatically
- Built-in Kubernetes support

### Docker CLI (Linux)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install docker.io
sudo systemctl start docker
sudo usermod -aG docker $USER

# CentOS/RHEL
sudo yum install docker
sudo systemctl start docker
```

## Docker Hub

Docker Hub is the official cloud-based registry for Docker images.

**Key Features:**
- Public and private repositories
- Official images (nginx, node, ubuntu, etc.)
- Automated builds
- Team collaboration

**Basic Commands:**
```bash
# Login to Docker Hub
docker login

# Pull image from Docker Hub
docker pull nginx

# Push your image
docker push username/my-app:tag
```

## Image Commands (Breadth Overview)

### Basic Image Operations
```bash
# List all images
docker images
docker image ls

# Pull an image
docker pull ubuntu:20.04
docker pull node:18-alpine

# Remove image
docker rmi image_name
docker image rm image_id

# Search images on Docker Hub
docker search nginx

# Build image from Dockerfile
docker build -t my-app:v1 .

# Tag an image
docker tag my-app:v1 username/my-app:latest

# Image history
docker history image_name

# Inspect image details
docker inspect image_name
```

### Image Cleanup
```bash
# Remove unused images
docker image prune

# Remove all unused images
docker image prune -a
```

## Container Commands (Breadth Overview)

### Basic Container Operations
```bash
# Run a container
docker run nginx
docker run -d nginx                    # Detached mode
docker run -p 8080:80 nginx           # Port mapping
docker run --name my-nginx nginx      # Custom name

# List containers
docker ps                              # Running containers
docker ps -a                          # All containers

# Stop/Start containers
docker stop container_name
docker start container_name
docker restart container_name

# Remove containers
docker rm container_name
docker rm $(docker ps -aq)           # Remove all containers
```

### Container Interaction
```bash
# Execute commands in running container
docker exec -it container_name bash
docker exec container_name ls /app

# View container logs
docker logs container_name
docker logs -f container_name         # Follow logs

# Copy files to/from container
docker cp file.txt container_name:/path/
docker cp container_name:/path/file.txt ./
```

### Container Management
```bash
# Container statistics
docker stats
docker stats container_name

# Inspect container
docker inspect container_name

# Container cleanup
docker container prune               # Remove stopped containers
```

## Building Your Own Images

### Creating a Dockerfile

A Dockerfile contains instructions to build a Docker image. Each instruction creates a new layer.

**Common Instructions:**
- `FROM`: Base image
- `RUN`: Execute commands during build
- `COPY/ADD`: Copy files into image
- `WORKDIR`: Set working directory
- `EXPOSE`: Document port usage
- `CMD/ENTRYPOINT`: Default command to run

## Node.js Application Examples

Let's build a Docker image for a basic Node.js application with different approaches.

**Sample Node.js App Structure:**
```
my-node-app/
├── package.json
├── package-lock.json
├── index.js
└── Dockerfile
```

### 1. Beginner Approach (Bad Practices)

```dockerfile
# BASE Image
FROM ubuntu
RUN apt-get update
RUN apt install -y curl
RUN curl -sL https://deb.nodesource.com/setup_22.x -o /tmp/nodesource_setup.sh
RUN bash /tmp/nodesource_setup.sh
RUN apt install -y nodejs
# Copying the source code to docker image
COPY index.js /home/app/index.js
COPY package.json /home/app/package.json
COPY package-lock.json /home/app/package-lock.json 
# Install the dependencies
WORKDIR /home/app
RUN npm install
```

**Problems with this approach:**
- ❌ Large base image (Ubuntu ~72MB vs Alpine ~5MB)
- ❌ Multiple RUN commands create unnecessary layers
- ❌ No CMD instruction to run the application
- ❌ Copying files individually is inefficient
- ❌ Installing Node.js manually when official images exist
- ❌ No optimization for Docker layer caching

### 2. Optimized Approach (Corrected Version)

```dockerfile
# BASE Image - Using official Node.js Alpine image
FROM node:20.17.0-alpine3.19

# Set working directory
WORKDIR /home/app

# Copy package files first (for better layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY index.js ./

# Expose port (documentation)
EXPOSE 3000

# Command to run the application
CMD ["npm", "start"]
```

**Improvements in optimized approach:**
- ✅ Uses official Node.js Alpine image (smaller, secure)
- ✅ Proper layer ordering for better caching
- ✅ Copy package files first, then install dependencies
- ✅ Copy source code after dependency installation
- ✅ Includes CMD instruction
- ✅ Uses WORKDIR for better organization
- ✅ Documents exposed port

### Building and Running

```bash
# Build the image
docker build -t my-node-app:v1 .

# Run the container
docker run -p 3000:3000 my-node-app:v1

# Run in detached mode
docker run -d -p 3000:3000 --name my-app my-node-app:v1
```

### Additional Optimization Tips

**Multi-stage builds** for production:
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

**Best Practices Summary:**
- Use official base images when available
- Minimize layers and image size
- Order Dockerfile instructions for optimal caching
- Use .dockerignore to exclude unnecessary files
- Don't run as root user in production
- Use multi-stage builds for smaller production images
- Pin specific versions for reproducibility

## Quick Reference Commands

```bash
# Build and run workflow
docker build -t my-app .
docker run -d -p 8080:3000 --name my-container my-app

# Development workflow
docker run -it --rm -v $(pwd):/app -w /app node:alpine sh

# Cleanup
docker system prune -a              # Clean everything
docker container prune              # Clean stopped containers
docker image prune                  # Clean unused images
```


 <!-- docker run -it my-app     -->
 <!-- docker build -t my-app .    -->