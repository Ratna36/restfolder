const WebSocket = require("ws");

// Initialize WebSocket server on port 8080
const wss = new WebSocket.Server({ port: 8080 });

console.log("WebSocket server is running on ws://localhost:8080");

// Handle client connections
wss.on("connection", (ws) => {
  console.log("A new client connected");

  // Handle incoming messages from clients
  ws.on("message", (message) => {
    console.log("Received message:", message);

    // Broadcast the message to all connected clients except the sender
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Handle client disconnection
  ws.on("close", () => {
    console.log("A client disconnected");
  });

  // Handle WebSocket errors
  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});