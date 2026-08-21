package hotelwebsite

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/internal/middleware"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/gin-gonic/gin"
)

type HotelWebsiteHandler struct {
	slog    *slog.Logger
	service HotelWebsiteService
}

func NewHotelWebsiteHandler(slog *slog.Logger, service HotelWebsiteService) *HotelWebsiteHandler {
	return &HotelWebsiteHandler{slog: slog, service: service}
}

func (h *HotelWebsiteHandler) Get(c *gin.Context) {
	site, err := h.service.Get(c.Request.Context(), middleware.HotelID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("hotel website fetched", site))
}

func (h *HotelWebsiteHandler) Update(c *gin.Context) {
	var req UpdateHotelWebsiteRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	site, err := h.service.Update(c.Request.Context(), middleware.HotelID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("hotel website updated", site))
}
