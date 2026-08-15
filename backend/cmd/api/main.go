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
	"github.com/bimal009/atithi/internal/auth"
	"github.com/bimal009/atithi/internal/hotel"
	handlers "github.com/bimal009/atithi/internal/imagekit"
	"github.com/bimal009/atithi/internal/middleware"
	"github.com/bimal009/atithi/internal/routes"
	"github.com/bimal009/atithi/internal/session"
	"github.com/bimal009/atithi/internal/user"
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

	sessionService := session.NewSessionService(slog, sessionRepo, cfg.Session.IdleTTL, cfg.Session.AbsoluteTTL)

	authService := auth.NewAuthService(slog, userRepo, redisClient, accountRepo, sessionService, pool)
	authHandler := auth.NewAuthHandler(slog, authService, cfg.Session, cfg.App.Env == "production")

	hotelService := hotel.NewHotelService(slog, hotelRepo)
	hotelHandler := hotel.NewHotelHandler(slog, hotelService)

	imageHandler := handlers.NewImageHandler(cfg)

	requireAuth := middleware.RequireAuth(sessionService, cfg.Session.CookieName, slog)

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

	routes.Register(r, &routes.Handlers{
		Auth:        authHandler,
		Hotel:       hotelHandler,
		Image:       imageHandler,
		RequireAuth: requireAuth,
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
