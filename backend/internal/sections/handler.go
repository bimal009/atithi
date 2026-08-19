package sections

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

type SectionHandler struct {
	slog    *slog.Logger
	service SectionService
}

func NewSectionHandler(slog *slog.Logger, service SectionService) *SectionHandler {
	return &SectionHandler{slog: slog, service: service}
}

func (h *SectionHandler) Create(c *gin.Context) {
	var req CreateSectionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	section, err := h.service.Create(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusCreated, responses.Success("section created", section))
}

func (h *SectionHandler) Get(c *gin.Context) {
	id := c.Param("sectionId")

	section, err := h.service.Get(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c))
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("section fetched", section))
}

func (h *SectionHandler) GetAll(c *gin.Context) {
	var pagination model.Pagination
	if err := c.ShouldBindQuery(&pagination); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid query parameters"))
		return
	}

	sections, err := h.service.GetAll(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), pagination)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("sections fetched", sections))
}

func (h *SectionHandler) Update(c *gin.Context) {
	id := c.Param("sectionId")

	var req UpdateSectionRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	section, err := h.service.Update(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("section updated", section))
}

func (h *SectionHandler) Delete(c *gin.Context) {
	id := c.Param("sectionId")

	if err := h.service.Delete(c.Request.Context(), id, middleware.HotelID(c), middleware.UserID(c)); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("section deleted", nil))
}
