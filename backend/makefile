include .env
export

MIGRATIONS_DIR =migrations
DB_URL = $(DATABASE_URL)

.PHONY: migrate-up migrate-down migrate-force migrate-version migrate-create build run test

migrate-up:
	migrate -path $(MIGRATIONS_DIR) -database "$(DB_URL)" up

migrate-down:
	migrate -path $(MIGRATIONS_DIR) -database "$(DB_URL)" down 1

migrate-down-all:
	migrate -path $(MIGRATIONS_DIR) -database "$(DB_URL)" down -all

migrate-force:
	migrate -path $(MIGRATIONS_DIR) -database "$(DB_URL)" force $(version)

migrate-version:
	migrate -path $(MIGRATIONS_DIR) -database "$(DB_URL)" version

migrate-create:
	migrate create -ext sql -dir $(MIGRATIONS_DIR) -seq $(name)

build:
	go build -o bin/server ./cmd/...

test:
	go test ./test/...

run-gateway:
	go run ./cmd/gateway/main.go