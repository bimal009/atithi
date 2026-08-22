package publicsite

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/gin-gonic/gin"
)

type PublicSiteHandler struct {
	slog    *slog.Logger
	service PublicSiteService
}

func NewPublicSiteHandler(slog *slog.Logger, service PublicSiteService) *PublicSiteHandler {
	return &PublicSiteHandler{slog: slog, service: service}
}

func (h *PublicSiteHandler) Get(c *gin.Context) {
	slug := c.Param("slug")

	site, err := h.service.GetSite(c.Request.Context(), slug)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("site fetched", site))
}
