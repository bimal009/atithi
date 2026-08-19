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
	ErrUserNotFound         = New(http.StatusNotFound, "not_found", "User not found")
	ErrUserAlreadyExists    = New(http.StatusConflict, "conflict", "User already exists")
	ErrHotelSlugExists      = New(http.StatusConflict, "conflict", "Slug already exists")
	ErrVerificationNotFound = New(http.StatusNotFound, "not_found", "Verification not found")
	ErrAccountNotFound      = New(http.StatusNotFound, "not_found", "Account not found")
	ErrInvalidOtp           = New(http.StatusBadRequest, "invalid_otp", "Invalid or expired OTP")
	ErrTooManyRequests      = New(http.StatusTooManyRequests, "too_many_requests", "Please wait before retrying")
	ErrTooManyOtpAttempts   = New(http.StatusTooManyRequests, "too_many_attempts", "Too many attempts, request a new OTP")
	ErrSessionNotFound      = New(http.StatusUnauthorized, "unauthorized", "Session not found")
	ErrSessionExpired       = New(http.StatusUnauthorized, "session_expired", "Session expired")
	ErrHotelNotFound        = New(http.StatusNotFound, "not_found", "Hotel not found")

	ErrRoleNotFound        = New(http.StatusNotFound, "not_found", "Role not found")
	ErrRoleSlugExists      = New(http.StatusConflict, "conflict", "Role slug already exists")
	ErrSystemRoleImmutable = New(http.StatusForbidden, "forbidden", "System roles are immutable")
	ErrRoleInUse           = New(http.StatusConflict, "conflict", "Role is still in use")

	ErrPermissionNotFound = New(http.StatusNotFound, "not_found", "Permission not found")
	ErrPermissionExists   = New(http.StatusConflict, "conflict", "Permission already exists")

	ErrEmailTaken = New(http.StatusConflict, "conflict", "Email already in use")

	ErrMemberNotFound    = New(http.StatusNotFound, "not_found", "Member not found")
	ErrMemberExists      = New(http.StatusConflict, "conflict", "Already a member of this hotel")
	ErrOwnerRoleReserved = New(http.StatusForbidden, "forbidden", "Owner role is reserved")
	ErrOwnerImmutable    = New(http.StatusForbidden, "forbidden", "Hotel owner cannot be changed")

	ErrRoomTypeNotFound   = New(http.StatusNotFound, "not_found", "Room type not found")
	ErrRoomTypeNameExists = New(http.StatusConflict, "conflict", "Room type name already exists")
	ErrInvalidInput       = New(http.StatusBadRequest, "invalid_input", "Invalid input")
	ErrInvalidPagination  = New(http.StatusBadRequest, "invalid_pagination", "Invalid page or limit")
	ErrLimitExceeded      = New(http.StatusBadRequest, "limit_exceeded", "Limit exceeded")

	ErrCustomerNotFound       = New(http.StatusNotFound, "not_found", "Customer not found")
	ErrCustomerPhoneExists    = New(http.StatusConflict, "conflict", "Phone number already exists")
	ErrCustomerDocumentExists = New(http.StatusConflict, "conflict", "Document number already exists")
	ErrDocumentMismatch       = New(http.StatusBadRequest, "invalid_input", "Document type and number must both be set")

	ErrRoomNotFound     = New(http.StatusNotFound, "not_found", "Room not found")
	ErrRoomNumberExists = New(http.StatusConflict, "conflict", "Room number already exists")
	ErrRoomTypeInvalid  = New(http.StatusBadRequest, "invalid_input", "Room type does not exist")

	ErrCabinNotFound     = New(http.StatusNotFound, "not_found", "Cabin not found")
	ErrCabinNumberExists = New(http.StatusConflict, "conflict", "Cabin number already exists")

	ErrTableNotFound       = New(http.StatusNotFound, "not_found", "Table not found")
	ErrTableNameExists     = New(http.StatusConflict, "conflict", "Table name already exists")
	ErrReservationNotFound = New(http.StatusNotFound, "not_found", "Reservation not found")
	ErrReservationOverlaps = New(http.StatusConflict, "conflict", "Table already reserved for that time")
	ErrTableInvalid        = New(http.StatusBadRequest, "invalid_input", "Table does not exist")

	ErrBillingTypeNotFound   = New(http.StatusNotFound, "not_found", "Billing type not found")
	ErrBillingTypeNameExists = New(http.StatusConflict, "conflict", "Billing type name already exists")
	ErrBillingTypeInUse      = New(http.StatusConflict, "conflict", "Billing type is still in use")

	ErrSectionNotFound   = New(http.StatusNotFound, "not_found", "Section not found")
	ErrSectionNameExists = New(http.StatusConflict, "conflict", "Section name already exists")
	ErrSectionInUse      = New(http.StatusConflict, "conflict", "Section is still in use")

	ErrSubMenuNotFound   = New(http.StatusNotFound, "not_found", "Sub-menu not found")
	ErrSubMenuNameExists = New(http.StatusConflict, "conflict", "Sub-menu name already exists")
	ErrSubMenuInUse      = New(http.StatusConflict, "conflict", "Sub-menu is still in use")

	ErrCategoryNotFound   = New(http.StatusNotFound, "not_found", "Category not found")
	ErrCategoryNameExists = New(http.StatusConflict, "conflict", "Category name already exists")
	ErrCategoryInUse      = New(http.StatusConflict, "conflict", "Category is still in use")

	ErrAddOnNotFound = New(http.StatusNotFound, "not_found", "Add-on not found")
	ErrAddOnExists   = New(http.StatusConflict, "conflict", "This add-on is already on your menu")

	ErrMenuSetNotFound   = New(http.StatusNotFound, "not_found", "Menu set not found")
	ErrMenuSetNameExists = New(http.StatusConflict, "conflict", "Menu set name already exists")

	ErrMenuItemNotFound = New(http.StatusNotFound, "not_found", "Menu item not found")
	ErrMenuItemExists   = New(http.StatusConflict, "conflict", "This dish is already on your menu")
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
			Message: "Validation failed",
			Error:   "validation_error",
			Data:    fields,
		})
		return
	}

	logger.Error("unhandled error", "error", err)
	c.JSON(http.StatusInternalServerError, responses.InternalServerError("Internal server error"))
}

func IsUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505"
	}
	return false
}

func UniqueViolationConstraint(err error) string {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return pgErr.ConstraintName
	}
	return ""
}

func IsForeignKeyViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23503"
	}
	return false
}
