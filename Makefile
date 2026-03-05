.PHONY: up down network

network:
	docker network create docker-default-network 2>/dev/null || true

up: network
	docker compose up --wait maven-mirror bootstrap-maven-mirror npm-mirror
	docker compose up --build -d

down:
	docker compose down
