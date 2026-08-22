package handlers

import (
	"fmt"
	"net/http"

	"github.com/bimal009/atithi/config"
	"github.com/bimal009/atithi/pkg/responses"
	"github.com/gin-gonic/gin"
	imagekit "github.com/imagekit-developer/imagekit-go/v2"
	"github.com/imagekit-developer/imagekit-go/v2/option"
)

type ImageHandler struct {
	cfg *config.Config
}

func NewImageHandler(cfg *config.Config) *ImageHandler {
	return &ImageHandler{cfg: cfg}
}

func (i *ImageHandler) CreateToken(c *gin.Context) {
	client := imagekit.NewClient(
		option.WithPrivateKey(i.cfg.ImageKit.PrivateKey),
	)

	params, err := client.Helper.GetAuthenticationParameters("", 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, responses.InternalServerError(fmt.Sprintf("failed to generate auth token: %s", err.Error())))
		return
	}

	data := ImageAuthTokenResponse{
		Signature:   params["signature"].(string),
		Expire:      params["expire"].(int64),
		Token:       params["token"].(string),
		PublicKey:   i.cfg.ImageKit.PublicKey,
		URLEndpoint: i.cfg.ImageKit.UrlEndpoint,
	}

	c.JSON(http.StatusOK, responses.Success("auth token generated", data))
}

func (i *ImageHandler) DeleteFile(c *gin.Context) {
	fileID := c.Param("fileId")
	if fileID == "" {
		c.JSON(http.StatusBadRequest, responses.BadRequest("fileId is required"))
		return
	}

	if err := DeleteFile(c.Request.Context(), i.cfg, fileID); err != nil {
		c.JSON(http.StatusInternalServerError, responses.InternalServerError(fmt.Sprintf("failed to delete file: %s", err.Error())))
		return
	}

	c.JSON(http.StatusOK, responses.Success[any]("file deleted", nil))
}
