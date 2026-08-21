package ws

import "encoding/json"

type Hub struct {
	register   chan *Client
	unregister chan *Client
	broadcast  chan *Message

	hotelClients map[string]map[*Client]bool
	userClients  map[string]*Client
}

func NewHub() *Hub {
	return &Hub{
		register:     make(chan *Client),
		unregister:   make(chan *Client),
		broadcast:    make(chan *Message),
		hotelClients: make(map[string]map[*Client]bool),
		userClients:  make(map[string]*Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			if h.hotelClients[client.hotelID] == nil {
				h.hotelClients[client.hotelID] = make(map[*Client]bool)
			}
			h.hotelClients[client.hotelID][client] = true
			h.userClients[client.userID] = client

		case client := <-h.unregister:
			if _, ok := h.hotelClients[client.hotelID][client]; ok {
				delete(h.hotelClients[client.hotelID], client)
				if len(h.hotelClients[client.hotelID]) == 0 {
					delete(h.hotelClients, client.hotelID)
				}
				if h.userClients[client.userID] == client {
					delete(h.userClients, client.userID)
				}
				close(client.send)
			}

		case message := <-h.broadcast:
			h.dispatch(message)
		}
	}
}

func (h *Hub) dropClient(client *Client) {
	delete(h.hotelClients[client.hotelID], client)
	if h.userClients[client.userID] == client {
		delete(h.userClients, client.userID)
	}
	close(client.send)
}

func (h *Hub) Broadcast(msg *Message) {
	h.broadcast <- msg
}

func (h *Hub) dispatch(message *Message) {
	data, err := json.Marshal(outboundEnvelope{Type: message.Type, Payload: message.Payload})
	if err != nil {
		return
	}

	if message.UserID != "" {
		if client, ok := h.userClients[message.UserID]; ok {
			select {
			case client.send <- data:
			default:
				h.dropClient(client)
			}
		}
		return
	}

	for client := range h.hotelClients[message.HotelID] {
		if len(message.Permissions) > 0 && !hasAnyPermission(client.permissions, message.Permissions) {
			continue
		}
		select {
		case client.send <- data:
		default:
			h.dropClient(client)
		}
	}
}

func hasAnyPermission(clientPerms map[string]bool, required []string) bool {
	for _, p := range required {
		if clientPerms[p] {
			return true
		}
	}
	return false
}
