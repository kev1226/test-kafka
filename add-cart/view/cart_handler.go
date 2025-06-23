package view

import (
	"add-service/config"
	"add-service/dto"
	"add-service/presenter"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

var RedisClient = config.InitRedis()

func AddToCart(c *gin.Context) {
	var input dto.AddToCartDTO
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	token := c.GetHeader("Authorization")
	if token == "" || !strings.HasPrefix(token, "Bearer ") {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token requerido"})
		return
	}
	token = strings.TrimPrefix(token, "Bearer ")

	err := presenter.AddToCart(input, token, RedisClient)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Producto agregado al carrito"})
}
