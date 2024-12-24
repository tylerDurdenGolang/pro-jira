package handler

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	_ "github.com/tank130701/course-work/todo-app/back-end/docs"
	"github.com/tank130701/course-work/todo-app/back-end/internal/service"
)

type Handler struct {
	services *service.Service
}

func NewHandler(services *service.Service) *Handler {
	return &Handler{services: services}
}

func (h *Handler) InitRoutes() *gin.Engine {
	router := gin.New()

	router.Use(gin.Logger()) // Adding Logger middleware

	config := cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},                   // Указываем разрешённые источники
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}, // Разрешённые методы
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"}, // Разрешённые заголовки
		AllowCredentials: true,                                                // Разрешить передачу cookies и других credentials
		MaxAge:           12 * time.Hour,                                      // Кэширование CORS-политики
	}

	router.Use(cors.New(config))
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	auth := router.Group("/auth")
	{
		auth.POST("/sign-up", h.signUp)
		auth.POST("/sign-in", h.signIn)
		auth.GET("/refresh", h.refreshToken)
		auth.POST("/logout", h.logout)
	}

	api := router.Group("/api", h.userIdentity)
	{
		categories := api.Group("/categories")
		{
			categories.POST("/", h.createCategory)
			categories.GET("/", h.getAllLists)
			categories.GET("/:id", h.getCategoryById)
			categories.PUT("/:id", h.updateCategory)
			categories.DELETE("/:id", h.deleteCategory)

			//items := categories.Group(":id/items")
			//{
			//	items.POST("/", h.createItem)
			//	items.GET("/", h.getAllItems)
			//}
		}

		items := api.Group("items")
		{
			items.POST("/:id", h.createItem)
			items.GET("/:id", h.getAllItems)
			//items.GET("/:id", h.getItemById)
			items.PUT("/:id", h.updateItem)
			items.DELETE("/:id", h.deleteItem)
		}
	}

	return router
}
