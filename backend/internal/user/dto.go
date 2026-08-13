package user

type CreateUserRequest struct {
	Name  string `json:"name" validate:"required,min=2,max=100"`
	Email string `json:"email" validate:"required,email"`
	Image string `json:"image,omitempty" validate:"omitempty,url"`
}
