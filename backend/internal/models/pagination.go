package model

import (
	"strings"

	"github.com/bimal009/atithi/pkg/apperr"
	"github.com/bimal009/atithi/pkg/validator"
)

const (
	DefaultPage  = 1
	DefaultLimit = 20
	MaxLimit     = 100
)

type Pagination struct {
	Search string `form:"search" json:"search" validate:"omitempty,max=200"`
	Page   int    `form:"page" json:"page" validate:"omitempty,gte=0"`
	Limit  int    `form:"limit" json:"limit" validate:"omitempty,gte=0,lte=100"`
}

func (p *Pagination) Validate() error {
	if err := validator.ValidateStruct(p); err != nil {
		return err
	}

	if p.Page < 0 {
		return apperr.ErrInvalidPagination
	}
	if p.Page == 0 {
		p.Page = DefaultPage
	}

	if p.Limit < 0 {
		return apperr.ErrInvalidPagination
	}
	if p.Limit == 0 {
		p.Limit = DefaultLimit
	}
	if p.Limit > MaxLimit {
		return apperr.ErrLimitExceeded
	}

	p.Search = strings.TrimSpace(p.Search)

	return nil
}

func (p *Pagination) Offset() int {
	return (p.Page - 1) * p.Limit
}
