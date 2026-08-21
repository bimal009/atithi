package ws

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	conn *websocket.Conn
	hub  *Hub
	send chan []byte

	userID      string
	hotelID     string
	roleID      string
	permissions map[string]bool
}

func (c *Client) ReadPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	for {
		messageType, p, err := c.conn.ReadMessage()
		if err != nil {
			log.Println(err)
			break
		}

		if messageType != websocket.TextMessage {
			continue
		}

		var msg Message
		if err := json.Unmarshal(p, &msg); err != nil {
			log.Println("invalid message:", err)
			continue
		}

		msg.HotelID = c.hotelID
		msg.UserID = c.userID

		c.hub.broadcast <- &msg
	}
}

const (
	writeWait  = 10 * time.Second
	pingPeriod = 54 * time.Second
)

func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case msg, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				log.Println("write error:", err)
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				log.Println("ping error:", err)
				return
			}
		}
	}
}
