package kafka

type AuthRequest struct {
	Token         string   `json:"token"`
	RequiredRoles []string `json:"requiredRoles"`
	Origin        string   `json:"origin,omitempty"`
}

type AuthResponse struct {
	Valid  bool     `json:"valid"`
	UserId int      `json:"userId"` // ✅ ahora acepta números
	Email  string   `json:"email"`
	Roles  []string `json:"roles"`
	Error  string   `json:"error,omitempty"`
}

type ProductRequest struct {
	ProductID string `json:"productId"`
}

type ProductResponse struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Price       float64 `json:"price"`
	Description string  `json:"description"`
	Stock       int     `json:"stock"`
	SKU         string  `json:"sku"`
	IsPublished bool    `json:"isPublished"`
	CreatedAt   string  `json:"createdAt"`
	UpdatedAt   string  `json:"updatedAt"`
	DeletedAt   *string `json:"deletedAt"` // puede ser null
}
