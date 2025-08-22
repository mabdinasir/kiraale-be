# Docker Image Commands

# List all images

docker images

# or

docker image ls

# Build an image from a Dockerfile

docker build -t <image_name>:<tag> .

# Remove an image

docker rmi <image_name_or_id>

# Pull an image from Docker Hub

docker pull <image_name>:<tag>

# Push an image to Docker Hub

docker push <image_name>:<tag>

# Tag an image

docker tag <source_image> <target_image>:<tag>

# Save an image to a tarball

docker save -o <output_file.tar> <image_name>:<tag>

# Load an image from a tarball

docker load -i <image_file.tar>

# Docker Container Commands

# List all containers (including stopped)

docker ps -a

# List only running containers

docker ps

# Run a container

docker run -d -p <host_port>:<container_port> --name <container_name> <image_name>:<tag>

<!-- docker run -p 8080:8080 kiraale-be -->

# Start a stopped container

docker start <container_name_or_id>

# Stop a running container

docker stop <container_name_or_id>

# Remove a container

docker rm <container_name_or_id>

# Execute a command inside a running container (e.g., bash shell)

docker exec -it <container_name_or_id> /bin/bash

# View logs of a container

docker logs <container_name_or_id>

# View real-time logs of a container

docker logs -f <container_name_or_id>

# Docker Volume Commands

# List volumes

docker volume ls

# Create a new volume

docker volume create <volume_name>

# Remove a volume

docker volume rm <volume_name>

# Docker Network Commands

# List networks

docker network ls

# Create a new network

docker network create <network_name>

# Remove a network

docker network rm <network_name>

# Docker System Commands

# Clean up unused containers, networks, volumes, and images

docker system prune -f

# View system-wide information

docker info

# Docker Compose Commands (if using Docker Compose)

# Start services defined in a docker-compose.yml file

docker-compose up

# Stop services

docker-compose down

# View the status of running services

docker-compose ps

# Build the images defined in the docker-compose.yml file

docker-compose build

# View logs of services

docker-compose logs

# Run a one-off command (e.g., bash) inside a service container

docker-compose run <service_name> /bin/bash

# Docker Network (Bridge)

# List all the active networks

docker network ls

# Connect a container to a network

docker network connect <network_name> <container_name>

# Disconnect a container from a network

docker network disconnect <network_name> <container_name>
