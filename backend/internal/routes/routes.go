package routes

import (
	"github.com/bimal009/atithi/internal/auth"
	"github.com/bimal009/atithi/internal/hotel"
	handlers "github.com/bimal009/atithi/internal/imagekit"
	"github.com/bimal009/atithi/internal/member"
	"github.com/bimal009/atithi/internal/role"
	roomtypes "github.com/bimal009/atithi/internal/roomTypes"
	"github.com/gin-gonic/gin"
)

type Handlers struct {
	Auth           *auth.AuthHandler
	Hotel          *hotel.HotelHandler
	RoomType       *roomtypes.RoomTypeHandler
	Role           *role.RoleHandler
	Member         *member.MemberHandler
	Image          *handlers.ImageHandler
	RequireAuth    gin.HandlerFunc
	ValidateHotel  gin.HandlerFunc
	ValidateMember gin.HandlerFunc
}

func Register(r *gin.Engine, h *Handlers) {
	api := r.Group("/api/v1")

	registerAuthRoutes(api, h.Auth, h.RequireAuth)
	registerHotelRoutes(api, h)
	registerUploadRoutes(api, h.Image, h.RequireAuth)
}

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
		authGroup.POST("/refresh", h.Refresh)
		authGroup.POST("/logout", h.Logout)

		authGroup.GET("/me", requireAuth, h.Me)
		authGroup.PATCH("/onboarding", requireAuth, h.Onboard)
	}
}

func registerHotelRoutes(rg *gin.RouterGroup, h *Handlers) {
	hotels := rg.Group("/hotels", h.RequireAuth)
	{
		hotels.POST("", h.Hotel.Create)
		hotels.GET("", h.Hotel.GetAll)
		hotels.GET("/check-slug", h.Hotel.CheckSlug)
		hotels.GET("/:id", h.Hotel.Get)
		hotels.GET("/slug/:slug", h.Hotel.GetBySlug)
		hotels.PATCH("/:id", h.Hotel.Update)
		hotels.DELETE("/:id", h.Hotel.Delete)
		scoped := hotels.Group("/slug/:slug", h.ValidateHotel, h.ValidateMember)
		{
			roomTypes := scoped.Group("/room-types")
			{
				roomTypes.POST("", h.RoomType.Create)
				roomTypes.GET("", h.RoomType.GetAll)
				roomTypes.GET("/:roomTypeId", h.RoomType.Get)
				roomTypes.PATCH("/:roomTypeId", h.RoomType.Update)
				roomTypes.DELETE("/:roomTypeId", h.RoomType.Delete)
			}

			scoped.GET("/permissions", h.Role.ListPermissions)

			roles := scoped.Group("/roles")
			{
				roles.GET("", h.Role.ListRoles)
				roles.GET("/system", h.Role.ListSystemRoles)
				roles.GET("/hotel", h.Role.ListHotelRoles)
				roles.GET("/assignable", h.Role.ListAssignableRoles)
				roles.POST("", h.Role.Create)
				roles.GET("/:roleId", h.Role.Get)
				roles.PATCH("/:roleId", h.Role.Update)
				roles.DELETE("/:roleId", h.Role.Delete)
			}

			members := scoped.Group("/members")
			{
				members.GET("", h.Member.List)
				members.POST("", h.Member.Add)
				members.PATCH("/:memberId", h.Member.Update)
				members.DELETE("/:memberId", h.Member.Remove)
			}
		}
	}
}
