package routes

import (
	"github.com/bimal009/atithi/internal/auth"
	"github.com/bimal009/atithi/internal/hotel"
	handlers "github.com/bimal009/atithi/internal/imagekit"
	"github.com/gin-gonic/gin"
)

type Handlers struct {
	Auth  *auth.AuthHandler
	Hotel *hotel.HotelHandler
	Image *handlers.ImageHandler
	// RequireAuth is the session middleware. Routes that need a logged-in
	// user go behind it.
	RequireAuth gin.HandlerFunc
}

func Register(r *gin.Engine, h *Handlers) {
	api := r.Group("/api/v1")

	registerAuthRoutes(api, h.Auth, h.RequireAuth)
	registerHotelRoutes(api, h.Hotel, h.RequireAuth)
	registerUploadRoutes(api, h.Image, h.RequireAuth)
}

// The token authorises an upload to our ImageKit account, so it is only ever
// handed to a signed-in user.
func registerUploadRoutes(
	rg *gin.RouterGroup,
	h *handlers.ImageHandler,
	requireAuth gin.HandlerFunc,
) {
	uploads := rg.Group("/uploads", requireAuth)
	{
		uploads.GET("/imagekit-auth", h.CreateToken)
	}
}

func registerAuthRoutes(rg *gin.RouterGroup, h *auth.AuthHandler, requireAuth gin.HandlerFunc) {
	authGroup := rg.Group("/auth")
	{
		authGroup.POST("/login", h.Login)
		authGroup.POST("/validate-otp", h.ValidateOtp)
		authGroup.POST("/resend-otp", h.Resend)

		// Refresh and logout stay open: both take the token off the request
		// themselves, and a caller whose session just died still needs logout
		// to clear the cookie and refresh to tell them to log in again.
		authGroup.POST("/refresh", h.Refresh)
		authGroup.POST("/logout", h.Logout)

		authGroup.GET("/me", requireAuth, h.Me)
		authGroup.PATCH("/onboarding", requireAuth, h.Onboard)
	}
}

func registerHotelRoutes(rg *gin.RouterGroup, h *hotel.HotelHandler, requireAuth gin.HandlerFunc) {
	hotels := rg.Group("/hotels", requireAuth)
	{
		hotels.POST("", h.Create)
		hotels.GET("", h.GetAll)
		hotels.GET("/:id", h.Get)
		hotels.GET("/slug/:slug", h.GetBySlug)
		hotels.PATCH("/:id", h.Update)
		hotels.DELETE("/:id", h.Delete)
	}
}
