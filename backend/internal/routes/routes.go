package routes

import (
	"github.com/bimal009/atithi/internal/auth"
	"github.com/bimal009/atithi/internal/hotel"
	"github.com/gin-gonic/gin"
)

type Handlers struct {
	Auth  *auth.AuthHandler
	Hotel *hotel.HotelHandler
}

func Register(r *gin.Engine, h *Handlers) {
	api := r.Group("/api/v1")

	registerAuthRoutes(api, h.Auth)
	registerHotelRoutes(api, h.Hotel)
}

func registerAuthRoutes(rg *gin.RouterGroup, h *auth.AuthHandler) {
	auth := rg.Group("/auth")
	{
		auth.POST("/login", h.Login)
		auth.POST("/validate-otp", h.ValidateOtp)
		auth.POST("/resend-otp", h.Resend)
	}
}

func registerHotelRoutes(rg *gin.RouterGroup, h *hotel.HotelHandler) {
	hotels := rg.Group("/hotels")
	{
		hotels.POST("", h.Create)
		hotels.GET("", h.GetAll)
		hotels.GET("/:id", h.Get)
		hotels.GET("/slug/:slug", h.GetBySlug)
		hotels.PATCH("/:id", h.Update)
		hotels.DELETE("/:id", h.Delete)
	}
}
