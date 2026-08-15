package config

import (
	"log"
	"time"

	"github.com/caarlos0/env/v11"
)

type App struct {
	Port        string   `env:"APP_PORT,required"`
	Env         string   `env:"APP_ENV" envDefault:"production"`
	FrontendURL []string `env:"FRONTEND_URL" envDefault:"http://localhost:3000"`
}

type DB struct {
	URL string `env:"DATABASE_URL,required"`
}

type ImageKit struct {
	PublicKey   string `env:"IMAGEKIT_PUBLIC_KEY,required"`
	PrivateKey  string `env:"IMAGEKIT_PRIVATE_KEY,required"`
	UrlEndpoint string `env:"IMAGEKIT_URL_ENDPOINT,required"`
}
type Session struct {
	Secret       string `env:"SESSION_SECRET,required"`
	CookieName   string `env:"COOKIE_NAME" envDefault:"_hiatithi_secure_token"`
	CookieMaxAge int    `env:"COOKIE_MAX_AGE" envDefault:"604800"` // 7 days

	// IdleTTL is how long a session survives without a refresh. Refreshing
	// pushes it forward; it should match CookieMaxAge so the browser drops the
	// cookie at roughly the same moment the server stops honouring it.
	IdleTTL time.Duration `env:"SESSION_IDLE_TTL" envDefault:"168h"`
	// AbsoluteTTL is the hard ceiling on a session's life. Refreshing never
	// moves it, so a stolen cookie cannot be kept alive forever.
	AbsoluteTTL time.Duration `env:"SESSION_ABSOLUTE_TTL" envDefault:"720h"`
}

type OAuthConfig struct {
	ClientID     string `env:"GOOGLE_CLIENT_ID,required"`
	ClientSecret string `env:"GOOGLE_CLIENT_SECRET,required"`
	RedirectURL  string `env:"GOOGLE_REDIRECT_URL,required"`
}

type RedisConfig struct {
	URL string `env:"UPSTASH_REDIS_URL,required"`
}
type ResendConfig struct {
	APIKey    string `env:"RESEND_API_KEY,required"`
	FromEmail string `env:"RESEND_FROM_EMAIL,required"`
	FromName  string `env:"RESEND_FROM_NAME" envDefault:"Tixort"`
}

type Config struct {
	App      App
	DB       DB
	Session  Session
	OAuth    OAuthConfig
	ImageKit ImageKit
	Redis    RedisConfig
	Resend   ResendConfig
}

func MustLoad() *Config {
	cfg := &Config{}

	if err := env.Parse(cfg); err != nil {
		log.Fatalf("failed to load env %v", err)
	}
	return cfg
}
