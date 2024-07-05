import { Client, StompSubscription } from "@stomp/stompjs";
import express from "express";
import { createServer } from "http";
import sockjs, { Connection } from "sockjs";

const app = express();
const server = createServer(app);
const sockServer = sockjs.createServer();

sockServer.on("connection", (conn: Connection) => {
  const stompServer = new Client({
    webSocketFactory: () => conn,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  stompServer.onConnect = () => {
    console.log("Connected");
    const subscription: StompSubscription = stompServer.subscribe(
      "/topic/messages",
      (message) => {
        console.log("Received message:", message.body);
        // Echo the received message
        stompServer.publish({
          destination: "/topic/messages",
          body: message.body,
        });
      }
    );

    conn.on("close", () => {
      subscription.unsubscribe();
      console.log("Connection closed");
    });
  };

  stompServer.activate();
});

sockServer.installHandlers(server, { prefix: "/ws" });

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
