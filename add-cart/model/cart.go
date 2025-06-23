package dto

type AddItemDTO struct {
	ProductID string `json:"productId" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
}

type UpdateItemDTO struct {
	ProductID string `json:"productId" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
}

type CartResponseDTO struct {
	ProductID string `json:"productId"`
	Quantity  int    `json:"quantity"`
}
