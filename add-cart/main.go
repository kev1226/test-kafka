package main

import (
	"add-service/routes"
)

func main() {
	router := routes.SetupRouter()
	router.Run(":3025") // usa 3000 o el puerto que prefieras
}
