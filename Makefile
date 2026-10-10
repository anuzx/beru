.PHONY: start stop restart clean

# Start all containers
start:
	@echo "Starting containers..."
	docker-compose up -d

# Stop all containers
stop:
	@echo "Stopping Docker containers..."
	docker-compose down

# Restart all containers
restart: stop start

# Clean everything (containers, images, volumes)
clean:
	@echo "Cleaning all Docker resources..."
	docker-compose down -v --rmi all --remove-orphans
