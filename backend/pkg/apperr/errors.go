package apperr

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/pkg/responses"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/gin-gonic/gin"
)

type AppError struct {
	Status  int
	Code    string
	Message string
}

func (e *AppError) Error() string {
	return e.Message
}

func New(status int, code, message string) *AppError {
	return &AppError{Status: status, Code: code, Message: message}
}

var (
	ErrUserNotFound         = New(http.StatusNotFound, "not_found", "user not found")
	ErrUserAlreadyExists    = New(http.StatusConflict, "conflict", "user already exists")
	ErrVerificationNotFound = New(http.StatusNotFound, "not_found", "verification not found")
	ErrAccountNotFound      = New(http.StatusNotFound, "not_found", "account not found")
	ErrInvalidOtp           = New(http.StatusBadRequest, "invalid_otp", "invalid or expired otp")
	ErrTooManyRequests      = New(http.StatusTooManyRequests, "too_many_requests", "please wait before requesting another otp")
	ErrSessionNotFound      = New(http.StatusTooManyRequests, "not_found", "session not found")
)

func HandleError(c *gin.Context, logger *slog.Logger, err error) {
	var appErr *AppError
	if errors.As(err, &appErr) {
		c.JSON(appErr.Status, &responses.Response[any]{
			Success: false,
			Message: appErr.Message,
			Error:   appErr.Code,
		})
		return
	}

	if fields := validator.FieldErrors(err); fields != nil {
		c.JSON(http.StatusBadRequest, &responses.Response[map[string]string]{
			Success: false,
			Message: "validation failed",
			Error:   "validation_error",
			Data:    fields,
		})
		return
	}

	logger.Error("unhandled error", "error", err)
	c.JSON(http.StatusInternalServerError, responses.InternalServerError("internal server error"))
}
