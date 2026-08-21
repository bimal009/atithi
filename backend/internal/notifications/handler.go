package notifications

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/internal/middleware"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	slog    *slog.Logger
	service NotificationService
}

func NewNotificationHandler(slog *slog.Logger, service NotificationService) *NotificationHandler {
	return &NotificationHandler{slog: slog, service: service}
}

func (h *NotificationHandler) Create(c *gin.Context) {
	var req CreateNotificationRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	notification, err := h.service.Create(c.Request.Context(), middleware.HotelID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusCreated, responses.Success("notification created", notification))
}

func (h *NotificationHandler) GetAll(c *gin.Context) {
	var query ListNotificationsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid query parameters"))
		return
	}

	notifications, err := h.service.GetAll(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), query)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("notifications fetched", notifications))
}

func (h *NotificationHandler) MarkRead(c *gin.Context) {
	id := c.Param("notificationId")

	notification, err := h.service.MarkRead(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("notification marked read", notification))
}

func (h *NotificationHandler) MarkAllRead(c *gin.Context) {
	count, err := h.service.MarkAllRead(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("notifications marked read", gin.H{"count": count}))
}

func (h *NotificationHandler) Delete(c *gin.Context) {
	id := c.Param("notificationId")

	if err := h.service.Delete(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c)); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("notification deleted", nil))
}
