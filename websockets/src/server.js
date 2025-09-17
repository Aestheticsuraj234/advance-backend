import express from "express";
import { WebSocketServer } from "ws";

const app = express();

const httpServer = app.listen(8080, () => {
  console.log("Server is listening on port 8080");
});

const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws) => {
  console.log("Client connected");
  ws.on("message", (message) => {
    console.log("received: %s", message);
  });

  ws.send("something");
});
