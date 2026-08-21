package ws

import (
	"log/slog"
	"net/http"

	"github.com/bimal009/atithi/internal/middleware"
	"github.com/bimal009/atithi/internal/permission"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func Upgrade(c *gin.Context, log *slog.Logger) (*websocket.Conn, error) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Error("websocket upgrade failed", "error", err, "remote_addr", c.Request.RemoteAddr)
		return nil, err
	}
	return conn, nil
}

func Handler(hub *Hub, permissionService permission.PermissionService, log *slog.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := middleware.UserID(c)
		hotelID := middleware.HotelID(c)

		currentMember, ok := middleware.CurrentMember(c)
		if !ok {
			c.AbortWithStatus(http.StatusForbidden)
			return
		}

		perms, err := permissionService.GetPermissionsForRole(c.Request.Context(), currentMember.RoleID)
		if err != nil {
			log.Error("failed to resolve permissions for ws client", "error", err, "userID", userID)
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}

		permSet := make(map[string]bool, len(perms))
		for _, p := range perms {
			permSet[p.Resource+":"+p.Action] = true
		}

		conn, err := Upgrade(c, log)
		if err != nil {
			return
		}

		client := &Client{
			conn:        conn,
			hub:         hub,
			send:        make(chan []byte, 256),
			userID:      userID,
			hotelID:     hotelID,
			roleID:      currentMember.RoleID,
			permissions: permSet,
		}

		hub.register <- client

		go client.WritePump()
		go client.ReadPump()
	}
}
