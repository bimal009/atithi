package apperr

import (
	"errors"
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/pkg/responses"
	"github.com/bimal009/atithi/pkg/validator"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgconn"
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
	ErrHotelSlugExists      = New(http.StatusConflict, "conflict", "slug already exists")
	ErrVerificationNotFound = New(http.StatusNotFound, "not_found", "verification not found")
	ErrAccountNotFound      = New(http.StatusNotFound, "not_found", "account not found")
	ErrInvalidOtp           = New(http.StatusBadRequest, "invalid_otp", "invalid or expired otp")
	ErrTooManyRequests      = New(http.StatusTooManyRequests, "too_many_requests", "please wait before requesting another otp")
	ErrSessionNotFound      = New(http.StatusUnauthorized, "unauthorized", "session not found")
	ErrSessionExpired       = New(http.StatusUnauthorized, "session_expired", "session expired, please log in again")
	ErrHotelNotFound        = New(http.StatusNotFound, "not_found", "hotel not found")

	ErrRoleNotFound        = New(http.StatusNotFound, "not_found", "role not found")
	ErrRoleSlugExists      = New(http.StatusConflict, "conflict", "a role with this slug already exists")
	ErrSystemRoleImmutable = New(http.StatusForbidden, "forbidden", "system roles cannot be modified or deleted")
	ErrRoleInUse           = New(http.StatusConflict, "conflict", "role is still assigned to members")

	ErrPermissionNotFound = New(http.StatusNotFound, "not_found", "permission not found")
	ErrPermissionExists   = New(http.StatusConflict, "conflict", "permission already exists")

	ErrMemberNotFound = New(http.StatusNotFound, "not_found", "member not found")
	ErrMemberExists   = New(http.StatusConflict, "conflict", "user is already a member of this hotel")
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

func IsUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505"
	}
	return false
}

func IsForeignKeyViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23503"
	}
	return false
}
