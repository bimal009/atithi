package validator

import (
	"errors"
	"reflect"
	"regexp"
	"strings"

	"github.com/go-playground/locales/en"
	ut "github.com/go-playground/universal-translator"
	"github.com/go-playground/validator/v10"
	en_translations "github.com/go-playground/validator/v10/translations/en"
)

var (
	validate = validator.New(validator.WithRequiredStructEnabled())
	trans    ut.Translator
)

func init() {
	locale := en.New()
	trans, _ = ut.New(locale, locale).GetTranslator("en")

	if err := en_translations.RegisterDefaultTranslations(validate, trans); err != nil {
		panic(err)
	}

	validate.RegisterTagNameFunc(func(fld reflect.StructField) string {
		name := strings.SplitN(fld.Tag.Get("json"), ",", 2)[0]
		if name == "" || name == "-" {
			return fld.Name
		}
		return name
	})

	if err := registerNepaliPhone(); err != nil {
		panic(err)
	}

	if err := registerAlphaNumDash(); err != nil {
		panic(err)
	}
}

var nepaliPhone = regexp.MustCompile(`^9[78]\d{8}$`)

func registerNepaliPhone() error {
	err := validate.RegisterValidation("nepaliphone", func(fl validator.FieldLevel) bool {
		return nepaliPhone.MatchString(fl.Field().String())
	})
	if err != nil {
		return err
	}

	return validate.RegisterTranslation("nepaliphone", trans,
		func(ut ut.Translator) error {
			return ut.Add("nepaliphone", "{0} must be a 10-digit Nepali mobile number starting with 98 or 97", true)
		},
		func(ut ut.Translator, fe validator.FieldError) string {
			msg, _ := ut.T("nepaliphone", fe.Field())
			return msg
		},
	)
}

// alphaNumDash matches a slug: alphanumeric segments joined by single dashes,
// so "hotel-everest" passes but "-everest", "hotel--everest" and "hotel_x" do not.
var alphaNumDash = regexp.MustCompile(`^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$`)

func registerAlphaNumDash() error {
	err := validate.RegisterValidation("alphanumdash", func(fl validator.FieldLevel) bool {
		return alphaNumDash.MatchString(fl.Field().String())
	})
	if err != nil {
		return err
	}

	return validate.RegisterTranslation("alphanumdash", trans,
		func(ut ut.Translator) error {
			return ut.Add("alphanumdash", "{0} may only contain letters, numbers and single dashes between them", true)
		},
		func(ut ut.Translator, fe validator.FieldError) string {
			msg, _ := ut.T("alphanumdash", fe.Field())
			return msg
		},
	)
}

func ValidateStruct(s any) error {
	return validate.Struct(s)
}

func FieldErrors(err error) map[string]string {
	var verrs validator.ValidationErrors
	if !errors.As(err, &verrs) {
		return nil
	}

	fields := make(map[string]string, len(verrs))
	for _, fe := range verrs {
		fields[fe.Field()] = fe.Translate(trans)
	}
	return fields
}
