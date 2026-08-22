package routes

import (
	"github.com/bimal009/atithi/internal/addons"
	"github.com/bimal009/atithi/internal/auth"
	billingtypes "github.com/bimal009/atithi/internal/billingTypes"
	"github.com/bimal009/atithi/internal/cabins"
	"github.com/bimal009/atithi/internal/categories"
	"github.com/bimal009/atithi/internal/customer"
	"github.com/bimal009/atithi/internal/gallery"
	"github.com/bimal009/atithi/internal/hotel"
	"github.com/bimal009/atithi/internal/publicsite"
	"github.com/bimal009/atithi/internal/hotelsettings"
	"github.com/bimal009/atithi/internal/hotelwebsite"
	handlers "github.com/bimal009/atithi/internal/imagekit"
	"github.com/bimal009/atithi/internal/member"
	"github.com/bimal009/atithi/internal/menuitems"
	"github.com/bimal009/atithi/internal/menusets"
	"github.com/bimal009/atithi/internal/notifications"
	"github.com/bimal009/atithi/internal/orders"
	"github.com/bimal009/atithi/internal/reservations"
	"github.com/bimal009/atithi/internal/role"
	roomtypes "github.com/bimal009/atithi/internal/roomTypes"
	"github.com/bimal009/atithi/internal/rooms"
	"github.com/bimal009/atithi/internal/sections"
	submenus "github.com/bimal009/atithi/internal/submenus"
	"github.com/bimal009/atithi/internal/tables"
	"github.com/gin-gonic/gin"
)

type Handlers struct {
	Auth           *auth.AuthHandler
	Hotel          *hotel.HotelHandler
	HotelSettings  *hotelsettings.HotelSettingsHandler
	HotelWebsite   *hotelwebsite.HotelWebsiteHandler
	Gallery        *gallery.GalleryHandler
	PublicSite     *publicsite.PublicSiteHandler
	BillingType    *billingtypes.BillingTypeHandler
	Category       *categories.CategoryHandler
	AddOn          *addons.AddOnHandler
	Section        *sections.SectionHandler
	SubMenu        *submenus.SubMenuHandler
	MenuItem       *menuitems.MenuItemHandler
	MenuSet        *menusets.MenuSetHandler
	RoomType       *roomtypes.RoomTypeHandler
	Room           *rooms.RoomHandler
	Cabin          *cabins.CabinHandler
	Table          *tables.TableHandler
	Reservation    *reservations.ReservationHandler
	Role           *role.RoleHandler
	Member         *member.MemberHandler
	Customer       *customer.CustomerHandler
	Order          *orders.OrderHandler
	Notification   *notifications.NotificationHandler
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
	registerPublicRoutes(api, h)

	api.GET("/dishes", h.RequireAuth, h.MenuItem.SearchDishes)
}

func registerPublicRoutes(rg *gin.RouterGroup, h *Handlers) {
	public := rg.Group("/public")
	{
		public.GET("/hotels/:slug/site", h.PublicSite.Get)
	}
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
			billingTypes := scoped.Group("/billing-types")
			{
				billingTypes.POST("", h.BillingType.Create)
				billingTypes.GET("", h.BillingType.GetAll)
				billingTypes.GET("/:billingTypeId", h.BillingType.Get)
				billingTypes.PATCH("/:billingTypeId", h.BillingType.Update)
				billingTypes.DELETE("/:billingTypeId", h.BillingType.Delete)
			}

			categoriesGroup := scoped.Group("/categories")
			{
				categoriesGroup.POST("", h.Category.Create)
				categoriesGroup.GET("", h.Category.GetAll)
				categoriesGroup.GET("/:categoryId", h.Category.Get)
				categoriesGroup.PATCH("/:categoryId", h.Category.Update)
				categoriesGroup.DELETE("/:categoryId", h.Category.Delete)
			}

			sectionsGroup := scoped.Group("/sections")
			{
				sectionsGroup.POST("", h.Section.Create)
				sectionsGroup.GET("", h.Section.GetAll)
				sectionsGroup.GET("/:sectionId", h.Section.Get)
				sectionsGroup.PATCH("/:sectionId", h.Section.Update)
				sectionsGroup.DELETE("/:sectionId", h.Section.Delete)
			}

			subMenusGroup := scoped.Group("/sub-menus")
			{
				subMenusGroup.POST("", h.SubMenu.Create)
				subMenusGroup.GET("", h.SubMenu.GetAll)
				subMenusGroup.GET("/:subMenuId", h.SubMenu.Get)
				subMenusGroup.PATCH("/:subMenuId", h.SubMenu.Update)
				subMenusGroup.DELETE("/:subMenuId", h.SubMenu.Delete)
			}

			addOnsGroup := scoped.Group("/add-ons")
			{
				addOnsGroup.POST("", h.AddOn.Create)
				addOnsGroup.GET("", h.AddOn.GetAll)
				addOnsGroup.GET("/:addOnId", h.AddOn.Get)
				addOnsGroup.PATCH("/:addOnId", h.AddOn.Update)
				addOnsGroup.DELETE("/:addOnId", h.AddOn.Delete)
			}

			menuItemsGroup := scoped.Group("/menu-items")
			{
				menuItemsGroup.POST("", h.MenuItem.Create)
				menuItemsGroup.GET("", h.MenuItem.GetAll)
				menuItemsGroup.GET("/:menuItemId", h.MenuItem.Get)
				menuItemsGroup.PATCH("/:menuItemId", h.MenuItem.Update)
				menuItemsGroup.DELETE("/:menuItemId", h.MenuItem.Delete)
			}

			menuSetsGroup := scoped.Group("/menu-sets")
			{
				menuSetsGroup.POST("", h.MenuSet.Create)
				menuSetsGroup.GET("", h.MenuSet.GetAll)
				menuSetsGroup.GET("/:menuSetId", h.MenuSet.Get)
				menuSetsGroup.PATCH("/:menuSetId", h.MenuSet.Update)
				menuSetsGroup.DELETE("/:menuSetId", h.MenuSet.Delete)
			}

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

			ordersGroup := scoped.Group("/orders")
			{
				ordersGroup.POST("", h.Order.Create)
				ordersGroup.GET("", h.Order.GetAll)
				ordersGroup.GET("/:orderId", h.Order.Get)
				ordersGroup.PATCH("/:orderId", h.Order.Update)
				ordersGroup.PATCH("/:orderId/status", h.Order.UpdateStatus)
				ordersGroup.DELETE("/:orderId", h.Order.Delete)
			}

			kitchenGroup := scoped.Group("/kitchen")
			{
				kitchenGroup.GET("/pending-count", h.Order.KitchenPendingCount)
				kitchenGroup.POST("/pending-count/reset", h.Order.ResetKitchenPendingCount)
			}

			settingsGroup := scoped.Group("/settings")
			{
				settingsGroup.GET("", h.HotelSettings.Get)
				settingsGroup.PATCH("", h.HotelSettings.Update)
			}

			websiteGroup := scoped.Group("/website")
			{
				websiteGroup.GET("", h.HotelWebsite.Get)
				websiteGroup.PATCH("", h.HotelWebsite.Update)
			}

			galleryGroup := scoped.Group("/gallery")
			{
				galleryGroup.POST("", h.Gallery.Create)
				galleryGroup.GET("", h.Gallery.GetAll)
				galleryGroup.DELETE("/:imageId", h.Gallery.Delete)
			}

			notificationsGroup := scoped.Group("/notifications")
			{
				notificationsGroup.POST("", h.Notification.Create)
				notificationsGroup.GET("", h.Notification.GetAll)
				notificationsGroup.PATCH("/read-all", h.Notification.MarkAllRead)
				notificationsGroup.PATCH("/:notificationId/read", h.Notification.MarkRead)
				notificationsGroup.DELETE("/:notificationId", h.Notification.Delete)
			}
		}
	}
}
