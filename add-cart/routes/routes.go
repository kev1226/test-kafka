package routes

import (
	"add-service/view"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()
	r.POST("/cart", view.AddToCart)
	return r
}
