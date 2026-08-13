package auth

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	slog    *slog.Logger
	service AuthService
}

func NewAuthHandler(slog *slog.Logger, service AuthService) *AuthHandler {
	return &AuthHandler{
		slog:    slog,
		service: service,
	}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	user, err := h.service.Login(c.Request.Context(), &req)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("otp sent sucessfully", user))
}

func (h *AuthHandler) ValidateOtp(c *gin.Context) {
	var req ValidateOtpRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	user, err := h.service.ValidateOtp(c.Request.Context(), req.PhoneNumber, req.Otp)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success("otp validated", user))
}

func (h *AuthHandler) Resend(c *gin.Context) {
	var req ResendOtpRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, responses.BadRequest("invalid request body"))
		return
	}

	if err := validator.ValidateStruct(&req); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	if err := h.service.Resend(c.Request.Context(), req.PhoneNumber); err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("otp resent", nil))
}
