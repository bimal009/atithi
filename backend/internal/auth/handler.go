package auth

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/config"
	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	slog    *slog.Logger
	service AuthService
	cookie  config.Session
	secure  bool
}

func NewAuthHandler(slog *slog.Logger, service AuthService, cookie config.Session, secure bool) *AuthHandler {
	return &AuthHandler{
		slog:    slog,
		service: service,
		cookie:  cookie,
		secure:  secure,
	}
}

func (h *AuthHandler) setSessionCookie(c *gin.Context, token string) {
	if h.secure {
		c.SetSameSite(http.SameSiteNoneMode)
	} else {
		c.SetSameSite(http.SameSiteLaxMode)
	}

	c.SetCookie(h.cookie.CookieName, token, h.cookie.CookieMaxAge, "/", "", h.secure, true)
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

	meta := SessionMeta{
		IPAddress: c.ClientIP(),
		UserAgent: c.Request.UserAgent(),
	}

	user, session, err := h.service.ValidateOtp(c.Request.Context(), req.PhoneNumber, req.Otp, meta)
	if err != nil {
		apperr.HandleError(c, h.slog, err)
		return
	}

	h.setSessionCookie(c, session.Token)

	c.JSON(http.StatusOK, responses.Success("otp validated", AuthResponse{
		User:    user,
		Session: NewSessionResponse(session),
	}))
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
