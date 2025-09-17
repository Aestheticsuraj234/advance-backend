import WebSocket , {WebSocketServer} from "ws";
import http from "http";


const server = http.createServer((req, res) => {
    console.log((new Date()) + " Received request for " + req.url);
    res.end("Hello World!");
})


const wss = new WebSocketServer({server});

wss.on("connection", (ws) => {
    console.log("Client connected");
    ws.on("message", (message) => {
        console.log("received: %s", message);
    });

    ws.send("something");

})

server.listen(8080, () => {
    console.log("Server is listening on port 8080");
})
