package billingtypes

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

type BillingTypeHandler struct {
	slog    *slog.Logger
	service BillingTypeService
}

func NewBillingTypeHandler(slog *slog.Logger, service BillingTypeService) *BillingTypeHandler {
	return &BillingTypeHandler{slog: slog, service: service}
}

func (h *BillingTypeHandler) Create(c *gin.Context) {
	var req CreateBillingTypeRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	billingType, err := h.service.Create(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusCreated, responses.Success("billing type created", billingType))
}

func (h *BillingTypeHandler) Get(c *gin.Context) {
	id := c.Param("billingTypeId")

	billingType, err := h.service.Get(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("billing type fetched", billingType))
}

func (h *BillingTypeHandler) GetAll(c *gin.Context) {
	var pagination model.Pagination
	if err := c.ShouldBindQuery(&pagination); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid query parameters"))
		return
	}

	billingTypes, err := h.service.GetAll(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), pagination)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("billing types fetched", billingTypes))
}

func (h *BillingTypeHandler) Update(c *gin.Context) {
	id := c.Param("billingTypeId")

	var req UpdateBillingTypeRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	billingType, err := h.service.Update(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("billing type updated", billingType))
}

func (h *BillingTypeHandler) Delete(c *gin.Context) {
	id := c.Param("billingTypeId")

	if err := h.service.Delete(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c)); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("billing type deleted", nil))
}
