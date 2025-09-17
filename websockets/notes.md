# WebSocket in Node.js - Complete Notes

## What is WebSocket?

WebSocket is a communication protocol that provides **full-duplex communication** over a single TCP connection. Unlike traditional HTTP requests, WebSocket allows **real-time, bidirectional communication** between client and server.

### Key Features:
- **Persistent connection** - stays open until explicitly closed
- **Low latency** - no need for repeated HTTP handshakes
- **Bidirectional** - both client and server can send messages anytime
- **Less overhead** - no HTTP headers on every message

## Why Do We Need WebSocket?

### Traditional HTTP Problems:
```
Client ----HTTP Request----> Server
Client <---HTTP Response---- Server
(Connection closes)
```

### WebSocket Solution:
```
Client ----WebSocket Handshake----> Server
Client <-------Messages-----------> Server
Client <-------Messages-----------> Server
(Connection stays open)
```

### Use Cases:
- **Real-time chat applications**
- **Live notifications**
- **Online gaming**
- **Stock price updates**
- **Collaborative editing (like Google Docs)**
- **Live sports scores**

## Basic WebSocket Implementation

### 1. With HTTP Server (Your Code Example)

```javascript
import WebSocket, { WebSocketServer } from "ws";
import http from "http";

// Create HTTP server
const server = http.createServer((req, res) => {
    console.log((new Date()) + " Received request for " + req.url);
    res.end("Hello World!");
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Handle WebSocket connections
wss.on("connection", (ws) => {
    console.log("Client connected");
    
    // Listen for messages from client
    ws.on("message", (message) => {
        console.log("Received: %s", message);
        
        // Echo message back to client
        ws.send(`Echo: ${message}`);
    });
    
    // Send welcome message
    ws.send("Welcome! Connection established.");
    
    // Handle connection close
    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

server.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
```

### 2. With Express Server

```javascript
import express from "express";
import { WebSocketServer } from "ws";
import http from "http";

const app = express();

// Serve static files (HTML, CSS, JS)
app.use(express.static('public'));

// Regular HTTP routes
app.get("/", (req, res) => {
    res.send("WebSocket Server Running!");
});

// Create HTTP server from Express app
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// WebSocket connection handling
wss.on("connection", (ws, req) => {
    console.log("New WebSocket connection from:", req.socket.remoteAddress);
    
    ws.on("message", (message) => {
        const data = JSON.parse(message);
        console.log("Received:", data);
        
        // Broadcast to all clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({
                    type: "broadcast",
                    message: data.message,
                    timestamp: new Date().toISOString()
                }));
            }
        });
    });
    
    ws.on("close", () => {
        console.log("Client disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
```

## Client-Side Implementation

### Simple HTML Client

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Client</title>
</head>
<body>
    <div id="messages"></div>
    <input type="text" id="messageInput" placeholder="Type message...">
    <button onclick="sendMessage()">Send</button>

    <script>
        const ws = new WebSocket('ws://localhost:3000');
        
        ws.onopen = function() {
            console.log('Connected to WebSocket');
            addMessage('Connected to server!');
        };
        
        ws.onmessage = function(event) {
            const data = JSON.parse(event.data);
            addMessage(`${data.message} (${data.timestamp})`);
        };
        
        ws.onclose = function() {
            console.log('Disconnected from WebSocket');
            addMessage('Disconnected from server!');
        };
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const message = input.value;
            
            if (message) {
                ws.send(JSON.stringify({ message: message }));
                input.value = '';
            }
        }
        
        function addMessage(message) {
            const messages = document.getElementById('messages');
            messages.innerHTML += `<div>${message}</div>`;
        }
    </script>
</body>
</html>
```

## Advanced Features

### 1. Broadcasting to All Clients

```javascript
// Send message to all connected clients
function broadcast(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}
```

### 2. Room-based Communication

```javascript
const rooms = new Map();

wss.on("connection", (ws) => {
    ws.on("message", (message) => {
        const data = JSON.parse(message);
        
        if (data.type === "join-room") {
            // Add client to room
            if (!rooms.has(data.room)) {
                rooms.set(data.room, new Set());
            }
            rooms.get(data.room).add(ws);
            ws.room = data.room;
        }
        
        if (data.type === "room-message") {
            // Send to all clients in the same room
            const roomClients = rooms.get(ws.room);
            if (roomClients) {
                roomClients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(data));
                    }
                });
            }
        }
    });
});
```

### 3. Authentication & Security

```javascript
import jwt from "jsonwebtoken";

wss.on("connection", (ws, req) => {
    // Extract token from URL or headers
    const token = new URL(req.url, 'http://localhost').searchParams.get('token');
    
    try {
        const decoded = jwt.verify(token, 'your-secret-key');
        ws.userId = decoded.userId;
        console.log(`User ${decoded.userId} connected`);
    } catch (error) {
        ws.close(1008, "Invalid token");
        return;
    }
    
    // Rest of connection handling...
});
```

## Installation & Setup

### 1. Install Dependencies

```bash
npm init -y
npm install ws express
```

### 2. Package.json Setup

```json
{
  "type": "module",
  "scripts": {
    "start": "node server.js"
  }
}
```

## Common Patterns

### 1. Heartbeat/Ping-Pong

```javascript
wss.on("connection", (ws) => {
    ws.isAlive = true;
    
    ws.on("pong", () => {
        ws.isAlive = true;
    });
});

// Check connection health every 30 seconds
setInterval(() => {
    wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
            ws.terminate();
            return;
        }
        
        ws.isAlive = false;
        ws.ping();
    });
}, 30000);
```

### 2. Error Handling

```javascript
ws.on("error", (error) => {
    console.error("WebSocket error:", error);
});

ws.on("close", (code, reason) => {
    console.log(`Connection closed: ${code} - ${reason}`);
});
```

## WebSocket vs HTTP Comparison

| Feature | HTTP | WebSocket |
|---------|------|-----------|
| Connection | Request-Response | Persistent |
| Communication | Unidirectional | Bidirectional |
| Overhead | High (headers every request) | Low (after handshake) |
| Real-time | No | Yes |
| Server Push | No | Yes |

## Best Practices

1. **Always handle errors and connection closes**
2. **Implement heartbeat/ping-pong for connection health**
3. **Use JSON for structured message format**
4. **Implement authentication for secure connections**
5. **Clean up resources when connections close**
6. **Use rooms/channels for organized communication**
7. **Validate incoming messages**
8. **Implement rate limiting to prevent abuse**

## Summary

WebSocket is essential for real-time applications where instant bidirectional communication is needed. It eliminates the need for polling and provides efficient, low-latency communication between client and server. Your code example shows the basic implementation, and with Express, you can easily build more complex real-time applications.