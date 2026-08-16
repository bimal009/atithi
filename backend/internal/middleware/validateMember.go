package middleware

import (
	"context"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/gin-gonic/gin"
)

const ContextMember = "member"

type MemberGetter interface {
	GetByHotelAndUser(ctx context.Context, hotelID, userID string) (model.Member, error)
}

func ValidateMember(repo MemberGetter, slog *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		current, err := repo.GetByHotelAndUser(c.Request.Context(), HotelID(c), UserID(c))
		if err != nil {
			apperr.HandleError(c, slog, err)
			c.Abort()
			return
		}

		if current.Status != model.MemberStatusActive {
			apperr.HandleError(c, slog, apperr.ErrMemberNotFound)
			c.Abort()
			return
		}

		c.Set(ContextMember, current)

		c.Next()
	}
}

func CurrentMember(c *gin.Context) (model.Member, bool) {
	value, ok := c.Get(ContextMember)
	if !ok {
		return model.Member{}, false
	}

	current, ok := value.(model.Member)
	return current, ok
}
