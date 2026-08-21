package hotelsettings

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/internal/middleware"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/gin-gonic/gin"
)

type HotelSettingsHandler struct {
	slog    *slog.Logger
	service HotelSettingsService
}

func NewHotelSettingsHandler(slog *slog.Logger, service HotelSettingsService) *HotelSettingsHandler {
	return &HotelSettingsHandler{slog: slog, service: service}
}

func (h *HotelSettingsHandler) Get(c *gin.Context) {
	settings, err := h.service.Get(c.Request.Context(), middleware.HotelID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("hotel settings fetched", settings))
}

func (h *HotelSettingsHandler) Update(c *gin.Context) {
	var req UpdateHotelSettingsRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	settings, err := h.service.Update(c.Request.Context(), middleware.HotelID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("hotel settings updated", settings))
}
