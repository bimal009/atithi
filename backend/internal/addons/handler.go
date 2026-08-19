package addons

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/internal/middleware"
	model "github.com/bimal009/atithi/internal/models"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/gin-gonic/gin"
)

type AddOnHandler struct {
	slog    *slog.Logger
	service AddOnService
}

func NewAddOnHandler(slog *slog.Logger, service AddOnService) *AddOnHandler {
	return &AddOnHandler{slog: slog, service: service}
}

func (h *AddOnHandler) Create(c *gin.Context) {
	var req CreateAddOnRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	addOn, err := h.service.Create(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusCreated, responses.Success("add-on created", addOn))
}

func (h *AddOnHandler) Get(c *gin.Context) {
	id := c.Param("addOnId")

	addOn, err := h.service.Get(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("add-on fetched", addOn))
}

func (h *AddOnHandler) GetAll(c *gin.Context) {
	var pagination model.Pagination
	if err := c.ShouldBindQuery(&pagination); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid query parameters"))
		return
	}

	addOns, err := h.service.GetAll(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), pagination)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("add-ons fetched", addOns))
}

func (h *AddOnHandler) Update(c *gin.Context) {
	id := c.Param("addOnId")

	var req UpdateAddOnRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	addOn, err := h.service.Update(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("add-on updated", addOn))
}

func (h *AddOnHandler) Delete(c *gin.Context) {
	id := c.Param("addOnId")

	if err := h.service.Delete(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c)); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("add-on deleted", nil))
}
