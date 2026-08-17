package cabins

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/internal/middleware"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/gin-gonic/gin"
)

type CabinHandler struct {
	slog    *slog.Logger
	service CabinService
}

func NewCabinHandler(slog *slog.Logger, service CabinService) *CabinHandler {
	return &CabinHandler{slog: slog, service: service}
}

func (h *CabinHandler) Create(c *gin.Context) {
	var req CreateCabinRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	cabin, err := h.service.Create(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusCreated, responses.Success("cabin created", cabin))
}

func (h *CabinHandler) Get(c *gin.Context) {
	id := c.Param("cabinId")

	cabin, err := h.service.Get(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("cabin fetched", cabin))
}

func (h *CabinHandler) GetAll(c *gin.Context) {
	var query ListCabinsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid query parameters"))
		return
	}

	cabins, err := h.service.GetAll(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), query)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("cabins fetched", cabins))
}

func (h *CabinHandler) Update(c *gin.Context) {
	id := c.Param("cabinId")

	var req UpdateCabinRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	cabin, err := h.service.Update(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("cabin updated", cabin))
}

func (h *CabinHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("cabinId")

	var req UpdateCabinStatusRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	cabin, err := h.service.UpdateStatus(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("cabin status updated", cabin))
}

func (h *CabinHandler) Delete(c *gin.Context) {
	id := c.Param("cabinId")

	if err := h.service.Delete(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c)); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("cabin deleted", nil))
}
