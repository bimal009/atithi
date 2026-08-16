package customer

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

type CustomerHandler struct {
	slog    *slog.Logger
	service CustomerService
}

func NewCustomerHandler(slog *slog.Logger, service CustomerService) *CustomerHandler {
	return &CustomerHandler{
		slog:    slog,
		service: service,
	}
}

func (h *CustomerHandler) Create(c *gin.Context) {
	var req CreateCustomerRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	customer, err := h.service.Create(c.Request.Context(), middleware.HotelID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusCreated, responses.Success("customer created", customer))
}

func (h *CustomerHandler) Get(c *gin.Context) {
	customer, err := h.service.Get(c.Request.Context(), c.Param("customerId"), middleware.HotelID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("customer fetched", customer))
}

func (h *CustomerHandler) List(c *gin.Context) {
	var pagination model.Pagination
	if err := c.ShouldBindQuery(&pagination); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid query parameters"))
		return
	}

	customers, err := h.service.List(c.Request.Context(), middleware.HotelID(c), pagination)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("customers fetched", customers))
}

func (h *CustomerHandler) Update(c *gin.Context) {
	var req UpdateCustomerRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	customer, err := h.service.Update(c.Request.Context(), c.Param("customerId"), middleware.HotelID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("customer updated", customer))
}

func (h *CustomerHandler) Delete(c *gin.Context) {
	if err := h.service.Delete(c.Request.Context(), c.Param("customerId"), middleware.HotelID(c)); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("customer deleted", nil))
}
