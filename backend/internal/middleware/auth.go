package middleware

import (
	"log/slog"
	"strings"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/internal/session"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/gin-gonic/gin"
)

const (
	ContextUserID  = "userID"
	ContextSession = "session"
)

func SessionToken(c *gin.Context, cookieName string) string {
	if token, err := c.Cookie(cookieName); err == nil && token != "" {
		return token
	}

	const prefix = "Bearer "
	if header := c.GetHeader("Authorization"); strings.HasPrefix(header, prefix) {
		return strings.TrimPrefix(header, prefix)
	}

	return ""
}

func RequireAuth(sessions session.SessionService, cookieName string, slog *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := SessionToken(c, cookieName)
		if token == "" {
			apperr.HandleError(c, slog, apperr.ErrSessionNotFound)
			c.Abort()
			return
		}

		current, err := sessions.Authenticate(c.Request.Context(), token)
		if err != nil {
			apperr.HandleError(c, slog, err)
			c.Abort()
			return
		}

		c.Set(ContextUserID, current.UserID)
		c.Set(ContextSession, current)

		c.Next()
	}
}

func UserID(c *gin.Context) string {
	value, ok := c.Get(ContextUserID)
	if !ok {
		return ""
	}

	id, _ := value.(string)
	return id
}

func CurrentSession(c *gin.Context) (model.Session, bool) {
	value, ok := c.Get(ContextSession)
	if !ok {
		return model.Session{}, false
	}

	current, ok := value.(model.Session)
	return current, ok
}
