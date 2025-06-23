package presenter

import (
	"add-service/dto"
	"add-service/entity"
	"add-service/kafka"
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()

func AddToCart(dto dto.AddToCartDTO, token string, redisClient *redis.Client) error {
	// ✅ Enviar token, roles requeridos y origen del request por Kafka
	authReq := kafka.AuthRequest{
		Token:         token,
		RequiredRoles: []string{"user"}, // o "admin" si corresponde
		Origin:        "cart",           // 👈 nuevo campo clave para enrutar respuesta
	}
	jsonBytes, _ := json.Marshal(authReq)
	if err := kafka.SendMessage(kafka.AuthRequestTopic, "auth", jsonBytes); err != nil {
		return fmt.Errorf("error sending auth: %v", err)
	}

	// ✅ Esperar respuesta del servicio de autenticación en topic exclusivo
	authRes, err := kafka.WaitForAuthResponse()
	if err != nil || !authRes.Valid {
		return fmt.Errorf("token inválido o sin permisos")
	}
	userId := authRes.UserId

	// ✅ Validar producto vía Kafka
	fmt.Println("📤 ID del producto a solicitar:", dto.ProductID)

	if dto.ProductID == "" {
		log.Println("❌ El ID del producto está vacío")
		return fmt.Errorf("ID de producto vacío")
	}

	prodReq, _ := json.Marshal(kafka.ProductRequest{ProductID: dto.ProductID})
	if err := kafka.SendMessage(kafka.ProductRequestTopic, "product", prodReq); err != nil {
		return fmt.Errorf("error sending product")
	}

	prodRes, err := kafka.WaitForProductResponse()
	log.Printf("✅ Producto deserializado: %+v\n", prodRes)

	if err != nil {
		return fmt.Errorf("producto no encontrado")
	}

	// ✅ Agregar al carrito en Redis
	item := entity.CartItem{
		ProductID: fmt.Sprintf("%d", prodRes.ID), // ahora ID es int
		Name:      prodRes.Name,
		Price:     prodRes.Price,
		Quantity:  dto.Quantity,
	}

	itemJson, _ := json.Marshal(item)
	key := fmt.Sprintf("cart:%d", userId)
	return redisClient.HSet(ctx, key, fmt.Sprintf("%d", prodRes.ID), itemJson).Err()

}
