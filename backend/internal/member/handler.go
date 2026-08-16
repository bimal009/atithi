package member

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

type MemberHandler struct {
	slog    *slog.Logger
	service MemberService
}

func NewMemberHandler(slog *slog.Logger, service MemberService) *MemberHandler {
	return &MemberHandler{
		slog:    slog,
		service: service,
	}
}

func (h *MemberHandler) List(c *gin.Context) {
	var pagination model.Pagination
	if err := c.ShouldBindQuery(&pagination); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid query parameters"))
		return
	}

	members, err := h.service.List(c.Request.Context(), middleware.HotelID(c), pagination)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("members fetched", members))
}

func (h *MemberHandler) Add(c *gin.Context) {
	var req AddMemberRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	member, err := h.service.Add(c.Request.Context(), middleware.HotelID(c), middleware.UserID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusCreated, responses.Success("member added", member))
}

func (h *MemberHandler) Update(c *gin.Context) {
	var req UpdateMemberRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	member, err := h.service.Update(c.Request.Context(), c.Param("memberId"), middleware.HotelID(c), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("member updated", member))
}

func (h *MemberHandler) Remove(c *gin.Context) {
	if err := h.service.Remove(c.Request.Context(), c.Param("memberId"), middleware.HotelID(c)); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("member removed", nil))
}
