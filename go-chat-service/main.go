package main

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"

	"github.com/gorilla/websocket"
	"github.com/mitchellh/mapstructure"
)

type PersistentMessage struct {
	MessageID string `json:"messageID"`
	Username  string `json:"username"`
	To        string `json:"to"`
	Message   string `json:"message"`
	Seen      bool   `json:"seen"`
}

type Message struct {
	MessageID   string      `json:"messageID"`
	MessageType string      `json:"messageType"`
	Username    string      `json:"username"`
	Content     interface{} `json:"content"`
	To          string      `json:"to"`
}

type ChatMessage struct {
	Message string `json:"message"`
}

type TypingMessage struct {
	Typing bool `json:"typing"`
}

type SeenMessage struct {
	Seen bool `json:"seen"`
}

var clients = make(map[string]*websocket.Conn)
var broadcast = make(chan Message)
var wg sync.WaitGroup

var upgrader = websocket.Upgrader{
	// ReadBufferSize:  1024,
	// WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool { return true },
}

func main() {
	http.HandleFunc("/", homePage)
	http.HandleFunc("/ws", handleConnections)

	go handleMessages()

	// Handle interrupts
	handleInterrupts(clients, &wg)

	fmt.Println("Server started on :8090")
	err := http.ListenAndServe(":8090", nil)
	if err != nil {
		panic("Error starting server: " + err.Error())
	}
}

func homePage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome to the Chat Room!")
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		panic(err)
	}
	defer ws.Close()

	wg.Add(1)
	defer wg.Done()

	for {
		var msg Message
		err := ws.ReadJSON(&msg)
		if err != nil {
			break
		}

		switch msg.MessageType {
		case "chat":
			var content ChatMessage
			mapstructure.Decode(msg.Content, &content)
			msg.Content = content
		case "typing":
			var content TypingMessage
			mapstructure.Decode(msg.Content, &content)
			msg.Content = content
		case "seen":
			var content SeenMessage
			mapstructure.Decode(msg.Content, &content)
			msg.Content = content
		}

		clients[msg.Username] = ws
		broadcast <- msg
	}
}

func handleMessages() {
	for {
		msg := <-broadcast
		fmt.Printf("sender:%s \n receiver:%s \n", msg.Username, msg.To)
		if client, ok := clients[msg.To]; ok {
			if msg.To != "-" {
				err := client.WriteJSON(msg)
				if err != nil {
					panic(err)
				}
			}
		}
	}
}

func handleInterrupts(clients map[string]*websocket.Conn, wg *sync.WaitGroup) {
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt, syscall.SIGTERM)
	go func() {
		<-c
		fmt.Println("\nReceived interrupt, closing connections...")
		for _, conn := range clients {
			// Send a close message to the client
			message := websocket.FormatCloseMessage(websocket.CloseNormalClosure, "")
			conn.WriteMessage(websocket.CloseMessage, message)

			// Close the connection
			conn.Close()
		}
		// wg.Wait()
		os.Exit(0)
	}()
}
