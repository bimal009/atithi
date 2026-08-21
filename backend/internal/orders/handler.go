package orders

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/internal/middleware"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	slog    *slog.Logger
	service OrderService
}

func NewOrderHandler(slog *slog.Logger, service OrderService) *OrderHandler {
	return &OrderHandler{slog: slog, service: service}
}

func (h *OrderHandler) Create(c *gin.Context) {
	var req CreateOrderRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	order, err := h.service.Create(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusCreated, responses.Success("order created", order))
}

func (h *OrderHandler) Get(c *gin.Context) {
	id := c.Param("orderId")

	order, err := h.service.Get(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("order fetched", order))
}

func (h *OrderHandler) GetAll(c *gin.Context) {
	var query ListOrdersQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid query parameters"))
		return
	}

	orders, err := h.service.GetAll(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), query)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("orders fetched", orders))
}

func (h *OrderHandler) Update(c *gin.Context) {
	id := c.Param("orderId")

	var req UpdateOrderRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	order, err := h.service.Update(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("order updated", order))
}

func (h *OrderHandler) UpdateStatus(c *gin.Context) {
	id := c.Param("orderId")

	var req UpdateOrderStatusRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	order, err := h.service.UpdateStatus(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("order status updated", order))
}

func (h *OrderHandler) KitchenPendingCount(c *gin.Context) {
	count, err := h.service.KitchenPendingCount(c.Request.Context(), middleware.HotelID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("kitchen pending count fetched", gin.H{"count": count}))
}

func (h *OrderHandler) ResetKitchenPendingCount(c *gin.Context) {
	if err := h.service.ResetKitchenPendingCount(c.Request.Context(), middleware.HotelID(c)); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("kitchen pending count reset", gin.H{"count": 0}))
}

func (h *OrderHandler) Delete(c *gin.Context) {
	id := c.Param("orderId")

	if err := h.service.Delete(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c)); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("order deleted", nil))
}
