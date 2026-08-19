package submenus

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

type SubMenuHandler struct {
	slog    *slog.Logger
	service SubMenuService
}

func NewSubMenuHandler(slog *slog.Logger, service SubMenuService) *SubMenuHandler {
	return &SubMenuHandler{slog: slog, service: service}
}

func (h *SubMenuHandler) Create(c *gin.Context) {
	var req CreateSubMenuRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	subMenu, err := h.service.Create(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusCreated, responses.Success("sub-menu created", subMenu))
}

func (h *SubMenuHandler) Get(c *gin.Context) {
	id := c.Param("subMenuId")

	subMenu, err := h.service.Get(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("sub-menu fetched", subMenu))
}

func (h *SubMenuHandler) GetAll(c *gin.Context) {
	var pagination model.Pagination
	if err := c.ShouldBindQuery(&pagination); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid query parameters"))
		return
	}

	subMenus, err := h.service.GetAll(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), pagination)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("sub-menus fetched", subMenus))
}

func (h *SubMenuHandler) Update(c *gin.Context) {
	id := c.Param("subMenuId")

	var req UpdateSubMenuRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	subMenu, err := h.service.Update(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("sub-menu updated", subMenu))
}

func (h *SubMenuHandler) Delete(c *gin.Context) {
	id := c.Param("subMenuId")

	if err := h.service.Delete(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c)); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("sub-menu deleted", nil))
}
