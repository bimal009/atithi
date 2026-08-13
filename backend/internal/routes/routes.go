package routes

import (
	"github.com/bimal009/atithi/internal/auth"
	"github.com/gin-gonic/gin"
)

type Handlers struct {
	Auth *auth.AuthHandler
}

func Register(r *gin.Engine, h *Handlers) {
	api := r.Group("/api/v1")

	registerAuthRoutes(api, h.Auth)
}

func registerAuthRoutes(rg *gin.RouterGroup, h *auth.AuthHandler) {
	auth := rg.Group("/auth")
	{
		auth.POST("/login", h.Login)
		auth.POST("/validate-otp", h.ValidateOtp)
		auth.POST("/resend-otp", h.Resend)
	}
}
