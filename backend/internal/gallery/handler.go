package gallery

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/internal/middleware"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/gin-gonic/gin"
)

type GalleryHandler struct {
	slog    *slog.Logger
	service GalleryService
}

func NewGalleryHandler(slog *slog.Logger, service GalleryService) *GalleryHandler {
	return &GalleryHandler{slog: slog, service: service}
}

func (h *GalleryHandler) Create(c *gin.Context) {
	var req CreateGalleryImageRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	image, err := h.service.Create(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusCreated, responses.Success("gallery image added", image))
}

func (h *GalleryHandler) GetAll(c *gin.Context) {
	images, err := h.service.GetAll(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("gallery images fetched", images))
}

func (h *GalleryHandler) Delete(c *gin.Context) {
	id := c.Param("imageId")

	if err := h.service.Delete(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c)); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("gallery image removed", nil))
}
