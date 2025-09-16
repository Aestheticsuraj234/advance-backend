


# 🚀 Notes: Pushing Docker Image to Docker Hub

### 1. **Create a Docker Hub Account**

* Go to [hub.docker.com](https://hub.docker.com)
* Sign up or log in.
* Create a **repository** where your image will be stored (e.g., `username/myapp`).

---

### 2. **Login to Docker Hub**

Run this in your terminal:

```bash
docker login
```

* Enter your **Docker Hub username** and **password**.
* If login is successful, you’ll see `Login Succeeded`.

---

### 3. **Build Your Docker Image**

Make sure your project has a `Dockerfile`.
Run:

```bash
docker build -t username/myapp:latest .
```

* `username` → your Docker Hub username.
* `myapp` → name of your repo (must match the repo name in Docker Hub).
* `:latest` → image tag (you can use versions like `:v1`, `:1.0.0`, etc.).

---

### 4. **Check Your Image**

Verify the image is built:

```bash
docker images
```

You should see something like:

```
REPOSITORY          TAG       IMAGE ID       SIZE
username/myapp      latest    abc12345       200MB
```

---

### 5. **Push Image to Docker Hub**

Run:

```bash
docker push username/myapp:latest
```

* This uploads your image to Docker Hub.
* Wait until it finishes (depends on size).

---

### 6. **Verify on Docker Hub**

* Go to [hub.docker.com](https://hub.docker.com) → your repo.
* You should see your image + tags.

---

### 7. **Pull & Run Image Anywhere**

On any system with Docker:

```bash
docker pull username/myapp:latest
docker run -p 3000:3000 username/myapp:latest
```

---

✅ **Quick Example**

```bash
docker build -t codestudent/notesapp:v1 .
docker push codestudent/notesapp:v1
docker pull codestudent/notesapp:v1
```



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