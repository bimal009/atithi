package role

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/internal/middleware"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/gin-gonic/gin"
)

type RoleHandler struct {
	slog    *slog.Logger
	service RoleService
}

func NewRoleHandler(slog *slog.Logger, service RoleService) *RoleHandler {
	return &RoleHandler{
		slog:    slog,
		service: service,
	}
}

func (h *RoleHandler) ListRoles(c *gin.Context) {
	roles, err := h.service.ListRoles(c.Request.Context(), middleware.HotelID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("roles fetched", roles))
}
