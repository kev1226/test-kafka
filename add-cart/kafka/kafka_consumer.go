package kafka

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/segmentio/kafka-go"
	kafkaLib "github.com/segmentio/kafka-go"
)

func WaitForAuthResponse() (*AuthResponse, error) {
	reader := kafkaLib.NewReader(kafkaLib.ReaderConfig{
		Brokers: []string{"localhost:9092"},  // ✅ local si estás fuera de Docker
		Topic:   "auth.verify.response.cart", // ✅ usamos el mismo topic para request & response
		GroupID: "add-cart-response-group",   // ✅ group único para evitar conflictos
	})

	ctx, cancel := context.WithTimeout(context.Background(), 20*time.Second)
	defer cancel()

	fmt.Println("🟢 Esperando respuesta de autenticación desde Kafka...")

	msg, err := reader.ReadMessage(ctx)
	if err != nil {
		log.Println("❌ Error al leer mensaje de autenticación:", err)
		return nil, err
	}

	fmt.Println("📨 Mensaje recibido de autenticación:", string(msg.Value))

	var res AuthResponse
	err = json.Unmarshal(msg.Value, &res)
	if err != nil {
		log.Println("❌ Error al parsear respuesta de autenticación:", err)
		return nil, err
	}

	if !res.Valid {
		log.Println("⚠️ Autenticación fallida (token inválido o sin permisos)")
	} else {
		log.Printf("✅ Usuario autenticado: ID %d, Email %s, Roles %v\n", res.UserId, res.Email, res.Roles)
	}

	return &res, nil
}

func WaitForProductResponse() (*ProductResponse, error) {
	reader := kafkaLib.NewReader(kafkaLib.ReaderConfig{
		Brokers:     []string{"localhost:9092"},
		Topic:       ProductResponseTopic,
		GroupID:     "cart-service-product-consumer",
		StartOffset: kafka.LastOffset,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	fmt.Println("🟢 Esperando respuesta del producto desde Kafka...")

	msg, err := reader.ReadMessage(ctx)
	if err != nil {
		log.Println("❌ Error al leer mensaje del producto:", err)
		return nil, err
	}

	fmt.Println("📨 Mensaje recibido de producto:", string(msg.Value))

	// Primero verifica si contiene error:
	if string(msg.Value) == "" || string(msg.Value) == "{}" || string(msg.Value) == "{\"error\":\"Error interno\"}" {
		return nil, fmt.Errorf("producto no encontrado o error interno")
	}

	var res ProductResponse
	err = json.Unmarshal(msg.Value, &res)
	if err != nil {
		log.Println("❌ Error al parsear respuesta del producto:", err)
		return nil, err
	}

	if res.ID == 0 {
		log.Println("⚠️ Respuesta inválida: sin ID de producto")
		return nil, fmt.Errorf("producto inválido")
	}

	log.Printf("✅ Producto encontrado: %d - %s ($%.2f)\n", res.ID, res.Name, res.Price)
	return &res, nil
}
