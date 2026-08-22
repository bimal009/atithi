package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/bimal009/atithi/config"
	"github.com/bimal009/atithi/internal/account"
	"github.com/bimal009/atithi/internal/addons"
	"github.com/bimal009/atithi/internal/auth"
	billingtypes "github.com/bimal009/atithi/internal/billingTypes"
	"github.com/bimal009/atithi/internal/cabins"
	"github.com/bimal009/atithi/internal/categories"
	"github.com/bimal009/atithi/internal/customer"
	"github.com/bimal009/atithi/internal/hotel"
	"github.com/bimal009/atithi/internal/hotelsettings"
	"github.com/bimal009/atithi/internal/gallery"
	"github.com/bimal009/atithi/internal/hotelwebsite"
	"github.com/bimal009/atithi/internal/publicsite"
	handlers "github.com/bimal009/atithi/internal/imagekit"
	"github.com/bimal009/atithi/internal/member"
	"github.com/bimal009/atithi/internal/menuitems"
	"github.com/bimal009/atithi/internal/menusets"
	"github.com/bimal009/atithi/internal/middleware"
	"github.com/bimal009/atithi/internal/notifications"
	"github.com/bimal009/atithi/internal/orderitems"
	"github.com/bimal009/atithi/internal/orders"
	"github.com/bimal009/atithi/internal/permission"
	"github.com/bimal009/atithi/internal/reservations"
	"github.com/bimal009/atithi/internal/role"
	roomtypes "github.com/bimal009/atithi/internal/roomTypes"
	"github.com/bimal009/atithi/internal/rooms"
	"github.com/bimal009/atithi/internal/routes"
	"github.com/bimal009/atithi/internal/sections"
	"github.com/bimal009/atithi/internal/session"
	submenus "github.com/bimal009/atithi/internal/submenus"
	"github.com/bimal009/atithi/internal/tables"
	"github.com/bimal009/atithi/internal/user"
	"github.com/bimal009/atithi/internal/ws"
	"github.com/bimal009/atithi/pkg/db"
	"github.com/bimal009/atithi/pkg/logger"
	"github.com/bimal009/atithi/pkg/redis"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()

	if err := godotenv.Load(); err != nil {
		log.Println("no .env file found, relying on environment variables")
	}

	cfg := config.MustLoad()
	slog := logger.New(cfg.App.Env)

	pool, err := db.ConnectDB(ctx, cfg.DB.URL, slog)
	if err != nil {
		slog.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	redisClient, err := redis.ConnectRedis(ctx, cfg.Redis.URL)
	if err != nil {
		slog.Error("failed to connect to redis", "error", err)
		os.Exit(1)
	}
	defer redisClient.Close()

	slog.Info("redis connected")

	userRepo := user.NewUserRepo(pool)
	accountRepo := account.NewAccountRepo(pool)
	sessionRepo := session.NewSessionRepo(pool)
	hotelRepo := hotel.NewHotelRepo(pool)
	memberRepo := member.NewMemberRepo(pool)
	roleRepo := role.NewRoleRepo(pool)
	permissionRepo := permission.NewPermissionRepo(pool)
	billingTypeRepo := billingtypes.NewBillingTypeRepo(pool)
	categoryRepo := categories.NewCategoryRepo(pool)
	addOnRepo := addons.NewAddOnRepo(pool)
	sectionRepo := sections.NewSectionRepo(pool)
	subMenuRepo := submenus.NewSubMenuRepo(pool)
	menuItemRepo := menuitems.NewMenuItemRepo(pool)
	menuSetRepo := menusets.NewMenuSetRepo(pool)
	roomTypeRepo := roomtypes.NewRoomTypeRepo(pool)
	roomRepo := rooms.NewRoomRepo(pool)
	cabinRepo := cabins.NewCabinRepo(pool)
	tableRepo := tables.NewTableRepo(pool)
	reservationRepo := reservations.NewReservationRepo(pool)
	customerRepo := customer.NewCustomerRepo(pool)
	orderItemRepo := orderitems.NewOrderItemRepo()
	orderRepo := orders.NewOrderRepo(pool, menuItemRepo, addOnRepo, orderItemRepo)

	hub := ws.NewHub()
	go hub.Run()

	notificationRepo := notifications.NewNotificationRepo(pool, hub)
	notificationService := notifications.NewNotificationService(slog, notificationRepo)
	notificationHandler := notifications.NewNotificationHandler(slog, notificationService)

	sessionService := session.NewSessionService(slog, sessionRepo, cfg.Session.IdleTTL, cfg.Session.AbsoluteTTL)

	authService := auth.NewAuthService(slog, userRepo, redisClient, accountRepo, sessionService, pool)
	authHandler := auth.NewAuthHandler(slog, authService, cfg.Session, cfg.App.Env == "production")

	hotelService := hotel.NewHotelService(slog, hotelRepo, memberRepo, roleRepo, pool)
	hotelHandler := hotel.NewHotelHandler(slog, hotelService)

	hotelSettingsRepo := hotelsettings.NewHotelSettingsRepo(pool)
	hotelSettingsService := hotelsettings.NewHotelSettingsService(slog, hotelSettingsRepo)
	hotelSettingsHandler := hotelsettings.NewHotelSettingsHandler(slog, hotelSettingsService)

	hotelWebsiteRepo := hotelwebsite.NewHotelWebsiteRepo(pool)
	hotelWebsiteService := hotelwebsite.NewHotelWebsiteService(slog, hotelWebsiteRepo)
	hotelWebsiteHandler := hotelwebsite.NewHotelWebsiteHandler(slog, hotelWebsiteService)

	galleryRepo := gallery.NewGalleryRepo(pool)
	galleryService := gallery.NewGalleryService(slog, galleryRepo)
	galleryHandler := gallery.NewGalleryHandler(slog, galleryService)

	publicSiteRepo := publicsite.NewPublicSiteRepo(pool)
	publicSiteService := publicsite.NewPublicSiteService(slog, publicSiteRepo)
	publicSiteHandler := publicsite.NewPublicSiteHandler(slog, publicSiteService)

	billingTypeService := billingtypes.NewBillingTypeService(slog, billingTypeRepo, notificationService)
	billingTypeHandler := billingtypes.NewBillingTypeHandler(slog, billingTypeService)

	categoryService := categories.NewCategoryService(slog, categoryRepo, notificationService)
	categoryHandler := categories.NewCategoryHandler(slog, categoryService)

	addOnService := addons.NewAddOnService(slog, addOnRepo, notificationService)
	addOnHandler := addons.NewAddOnHandler(slog, addOnService)

	sectionService := sections.NewSectionService(slog, sectionRepo, notificationService)
	sectionHandler := sections.NewSectionHandler(slog, sectionService)

	subMenuService := submenus.NewSubMenuService(slog, subMenuRepo, notificationService)
	subMenuHandler := submenus.NewSubMenuHandler(slog, subMenuService)

	menuItemService := menuitems.NewMenuItemService(slog, menuItemRepo, notificationService)
	menuItemHandler := menuitems.NewMenuItemHandler(slog, menuItemService)

	menuSetService := menusets.NewMenuSetService(slog, menuSetRepo, notificationService)
	menuSetHandler := menusets.NewMenuSetHandler(slog, menuSetService)

	roomTypeService := roomtypes.NewRoomTypeService(slog, roomTypeRepo, notificationService)
	roomTypeHandler := roomtypes.NewRoomTypeHandler(slog, roomTypeService)

	roomService := rooms.NewRoomService(slog, roomRepo, notificationService)
	roomHandler := rooms.NewRoomHandler(slog, roomService)

	cabinService := cabins.NewCabinService(slog, cabinRepo, notificationService)
	cabinHandler := cabins.NewCabinHandler(slog, cabinService)

	tableService := tables.NewTableService(slog, tableRepo, notificationService)
	tableHandler := tables.NewTableHandler(slog, tableService)

	reservationService := reservations.NewReservationService(slog, reservationRepo, notificationService)
	reservationHandler := reservations.NewReservationHandler(slog, reservationService)

	permissionService := permission.NewPermissionService(permissionRepo)

	roleService := role.NewRoleService(slog, roleRepo, permissionRepo, pool, notificationService)
	roleHandler := role.NewRoleHandler(slog, roleService)

	memberService := member.NewMemberService(slog, memberRepo, roleRepo, userRepo, pool, notificationService)
	memberHandler := member.NewMemberHandler(slog, memberService)

	customerService := customer.NewCustomerService(slog, customerRepo, notificationService)
	customerHandler := customer.NewCustomerHandler(slog, customerService)

	orderService := orders.NewOrderService(slog, orderRepo, hub, notificationService, redisClient, hotelSettingsRepo)
	orderHandler := orders.NewOrderHandler(slog, orderService)

	imageHandler := handlers.NewImageHandler(cfg)

	requireAuth := middleware.RequireAuth(sessionService, cfg.Session.CookieName, slog)
	validateHotel := middleware.ValidateHotel(hotelService, slog)
	validateMember := middleware.ValidateMember(memberRepo, slog)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.App.FrontendURL,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	started := time.Now()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, responses.Success("ok", gin.H{
			"uptime": time.Since(started).String(),
		}))
	})

	r.GET("/hotels/slug/:slug/ws", requireAuth, validateHotel, validateMember, ws.Handler(hub, permissionService, slog))

	routes.Register(r, &routes.Handlers{
		Auth:           authHandler,
		Hotel:          hotelHandler,
		HotelSettings:  hotelSettingsHandler,
		HotelWebsite:   hotelWebsiteHandler,
		Gallery:        galleryHandler,
		PublicSite:     publicSiteHandler,
		BillingType:    billingTypeHandler,
		Category:       categoryHandler,
		AddOn:          addOnHandler,
		Section:        sectionHandler,
		SubMenu:        subMenuHandler,
		MenuItem:       menuItemHandler,
		MenuSet:        menuSetHandler,
		RoomType:       roomTypeHandler,
		Room:           roomHandler,
		Cabin:          cabinHandler,
		Table:          tableHandler,
		Reservation:    reservationHandler,
		Role:           roleHandler,
		Member:         memberHandler,
		Customer:       customerHandler,
		Order:          orderHandler,
		Notification:   notificationHandler,
		Image:          imageHandler,
		RequireAuth:    requireAuth,
		ValidateHotel:  validateHotel,
		ValidateMember: validateMember,
	})

	srv := &http.Server{
		Addr:         ":" + cfg.App.Port,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		slog.Info("server starting", "addr", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("failed to start server", "error", err)
			os.Exit(1)
		}
	}()

	<-ctx.Done()
	slog.Info("shutting down server gracefully")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		slog.Error("server forced shutdown", "error", err)
	}

	slog.Info("server exited")
}
