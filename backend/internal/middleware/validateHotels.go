package middleware

import (
	"context"
	"log/slog"

	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/gin-gonic/gin"
)

const ContextHotelID = "hotelID"

type HotelGetter interface {
	FindBySlug(ctx context.Context, slug string) (model.Hotel, error)
}

func ValidateHotel(service HotelGetter, slog *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		slug := c.Param("slug")
		if slug == "" {
			apperr.HandleError(c, slog, apperr.ErrHotelNotFound)
			c.Abort()
			return
		}

		current, err := service.FindBySlug(c.Request.Context(), slug)
		if err != nil {
			apperr.HandleError(c, slog, err)
			c.Abort()
			return
		}

		c.Set(ContextHotelID, current.ID)

		c.Next()
	}
}

func HotelID(c *gin.Context) string {
	value, ok := c.Get(ContextHotelID)
	if !ok {
		return ""
	}

	id, _ := value.(string)
	return id
}
