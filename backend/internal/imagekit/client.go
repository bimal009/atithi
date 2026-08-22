package handlers

import (
	"context"

	"github.com/bimal009/atithi/config"
	imagekit "github.com/imagekit-developer/imagekit-go/v2"
	"github.com/imagekit-developer/imagekit-go/v2/option"
)

func DeleteFile(ctx context.Context, cfg *config.Config, fileID string) error {
	if fileID == "" {
		return nil
	}
	client := imagekit.NewClient(option.WithPrivateKey(cfg.ImageKit.PrivateKey))
	return client.Files.Delete(ctx, fileID)
}
