package menuitems

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/internal/middleware"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/gin-gonic/gin"
)

type MenuItemHandler struct {
	slog    *slog.Logger
	service MenuItemService
}

func NewMenuItemHandler(slog *slog.Logger, service MenuItemService) *MenuItemHandler {
	return &MenuItemHandler{slog: slog, service: service}
}

// SearchDishes is not hotel-scoped: it searches the shared catalog across
// every hotel on the platform, so any signed-in staff member can reuse an
// existing dish instead of creating a duplicate.
func (h *MenuItemHandler) SearchDishes(c *gin.Context) {
	search := c.Query("search")

	dishes, err := h.service.SearchDishes(c.Request.Context(), search)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("dishes fetched", dishes))
}

func (h *MenuItemHandler) Create(c *gin.Context) {
	var req CreateMenuItemRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	item, err := h.service.Create(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusCreated, responses.Success("menu item created", item))
}

func (h *MenuItemHandler) Get(c *gin.Context) {
	id := c.Param("menuItemId")

	item, err := h.service.Get(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("menu item fetched", item))
}

func (h *MenuItemHandler) GetAll(c *gin.Context) {
	var query ListMenuItemsQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid query parameters"))
		return
	}

	items, err := h.service.GetAll(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), query)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("menu items fetched", items))
}

func (h *MenuItemHandler) Update(c *gin.Context) {
	id := c.Param("menuItemId")

	var req UpdateMenuItemRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	item, err := h.service.Update(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("menu item updated", item))
}

func (h *MenuItemHandler) Delete(c *gin.Context) {
	id := c.Param("menuItemId")

	if err := h.service.Delete(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c)); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("menu item deleted", nil))
}
