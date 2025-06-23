package config

import (
	"context"
	"log"

	"github.com/redis/go-redis/v9"
)

var Ctx = context.Background()

func InitRedis() *redis.Client {
	client := redis.NewClient(&redis.Options{
		Addr:     "localhost:6379",
		Password: "CartService123!",
		DB:       0,
	})

	if _, err := client.Ping(Ctx).Result(); err != nil {
		log.Fatalf("❌ No se pudo conectar a Redis: %v", err)
	}
	log.Println("✅ Conectado a Redis correctamente")
	return client
}
