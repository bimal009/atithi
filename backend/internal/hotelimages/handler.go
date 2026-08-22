package hotelimages

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/internal/middleware"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/gin-gonic/gin"
)

type HotelImageHandler struct {
	slog    *slog.Logger
	service HotelImageService
}

func NewHotelImageHandler(slog *slog.Logger, service HotelImageService) *HotelImageHandler {
	return &HotelImageHandler{slog: slog, service: service}
}

func (h *HotelImageHandler) Create(c *gin.Context) {
	var req CreateHotelImageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	img, err := h.service.Create(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusCreated, responses.Success("image added", img))
}

func (h *HotelImageHandler) GetAll(c *gin.Context) {
	entityType := c.Query("type")
	var entityID *string
	if v := c.Query("entityId"); v != "" {
		entityID = &v
	}

	res, err := h.service.List(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), entityType, entityID)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("images fetched", res))
}

func (h *HotelImageHandler) Delete(c *gin.Context) {
	id := c.Param("imageId")

	if err := h.service.Delete(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c)); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("image removed", nil))
}
