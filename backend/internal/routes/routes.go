package routes

import (
	"github.com/bimal009/atithi/internal/auth"
	"github.com/bimal009/atithi/internal/cabins"
	"github.com/bimal009/atithi/internal/customer"
	"github.com/bimal009/atithi/internal/hotel"
	handlers "github.com/bimal009/atithi/internal/imagekit"
	"github.com/bimal009/atithi/internal/member"
	"github.com/bimal009/atithi/internal/reservations"
	"github.com/bimal009/atithi/internal/role"
	roomtypes "github.com/bimal009/atithi/internal/roomTypes"
	"github.com/bimal009/atithi/internal/rooms"
	"github.com/bimal009/atithi/internal/tables"
	"github.com/gin-gonic/gin"
)

type Handlers struct {
	Auth           *auth.AuthHandler
	Hotel          *hotel.HotelHandler
	RoomType       *roomtypes.RoomTypeHandler
	Room           *rooms.RoomHandler
	Cabin          *cabins.CabinHandler
	Table          *tables.TableHandler
	Reservation    *reservations.ReservationHandler
	Role           *role.RoleHandler
	Member         *member.MemberHandler
	Customer       *customer.CustomerHandler
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

			roomsGroup := scoped.Group("/rooms")
			{
				roomsGroup.POST("", h.Room.Create)
				roomsGroup.GET("", h.Room.GetAll)
				roomsGroup.GET("/:roomId", h.Room.Get)
				roomsGroup.PATCH("/:roomId", h.Room.Update)
				roomsGroup.PATCH("/:roomId/status", h.Room.UpdateStatus)
				roomsGroup.DELETE("/:roomId", h.Room.Delete)
			}

			cabinsGroup := scoped.Group("/cabins")
			{
				cabinsGroup.POST("", h.Cabin.Create)
				cabinsGroup.GET("", h.Cabin.GetAll)
				cabinsGroup.GET("/:cabinId", h.Cabin.Get)
				cabinsGroup.PATCH("/:cabinId", h.Cabin.Update)
				cabinsGroup.PATCH("/:cabinId/status", h.Cabin.UpdateStatus)
				cabinsGroup.DELETE("/:cabinId", h.Cabin.Delete)
			}

			tablesGroup := scoped.Group("/tables")
			{
				tablesGroup.POST("", h.Table.Create)
				tablesGroup.GET("", h.Table.GetAll)
				tablesGroup.GET("/:tableId", h.Table.Get)
				tablesGroup.PATCH("/:tableId", h.Table.Update)
				tablesGroup.PATCH("/:tableId/status", h.Table.UpdateStatus)
				tablesGroup.DELETE("/:tableId", h.Table.Delete)
			}

			reservationsGroup := scoped.Group("/reservations")
			{
				reservationsGroup.POST("", h.Reservation.Create)
				reservationsGroup.GET("", h.Reservation.GetAll)
				reservationsGroup.GET("/:reservationId", h.Reservation.Get)
				reservationsGroup.PATCH("/:reservationId", h.Reservation.Update)
				reservationsGroup.PATCH("/:reservationId/status", h.Reservation.UpdateStatus)
				reservationsGroup.DELETE("/:reservationId", h.Reservation.Delete)
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

			customers := scoped.Group("/customers")
			{
				customers.GET("", h.Customer.List)
				customers.POST("", h.Customer.Create)
				customers.GET("/:customerId", h.Customer.Get)
				customers.PATCH("/:customerId", h.Customer.Update)
				customers.DELETE("/:customerId", h.Customer.Delete)
			}
		}
	}
}
