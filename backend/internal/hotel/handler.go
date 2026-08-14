package hotel

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/gin-gonic/gin"
)

type HotelHandler struct {
	slog    *slog.Logger
	service HotelService
}

func NewHotelHandler(slog *slog.Logger, service HotelService) *HotelHandler {
	return &HotelHandler{
		slog:    slog,
		service: service,
	}
}

func (h *HotelHandler) Create(c *gin.Context) {
	var req CreateHotelRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	hotel, err := h.service.Create(c.Request.Context(), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusCreated, responses.Success("hotel created", hotel))
}

func (h *HotelHandler) Get(c *gin.Context) {
	id := c.Param("id")

	hotel, err := h.service.Get(c.Request.Context(), id)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("hotel fetched", hotel))
}

func (h *HotelHandler) GetBySlug(c *gin.Context) {
	slug := c.Param("slug")

	hotel, err := h.service.GetBySlug(c.Request.Context(), slug)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("hotel fetched", hotel))
}

func (h *HotelHandler) GetAll(c *gin.Context) {
	hotels, err := h.service.GetAll(c.Request.Context())
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("hotels fetched", hotels))
}

func (h *HotelHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var req UpdateHotelRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	hotel, err := h.service.Update(c.Request.Context(), id, &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("hotel updated", hotel))
}

func (h *HotelHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	if err := h.service.Delete(c.Request.Context(), id); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("hotel deleted", nil))
}
