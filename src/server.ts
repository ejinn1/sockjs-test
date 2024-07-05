import cors from "cors";
import express from "express";
import { createServer } from "http";
import sockjs from "sockjs";

// Express 앱 생성
const app = express();
app.use(
  cors({
    origin: "http://localhost:3000", // 클라이언트의 출처를 명시
    credentials: true, // 자격 증명 허용
  })
);

// HTTP 서버 생성
const server = createServer(app);

// SockJS 서버 생성
const sockjsServer = sockjs.createServer({ prefix: "/ws" });

// STOMP 메시지 핸들러 설정
sockjsServer.on("connection", (conn: sockjs.Connection) => {
  console.log("conn", conn);

  console.log("Client connected");
  conn.write(
    JSON.stringify({
      command: "CONNECTED",
      message: "Connection successful",
    })
  );

  conn.on("data", (message: string) => {
    console.log("Received message:", message);
    try {
      // 클라이언트에 "CONNECTED" 메시지 전송
      conn.write(
        JSON.stringify({
          command: "CONNECTED",
          message: "Connection successful",
        })
      );
    } catch (e) {
      console.error("Failed to send message:", e);
    }
  });

  conn.on("close", () => {
    console.log("Client disconnected");
  });
});

// SockJS 서버와 HTTP 서버 연결
sockjsServer.installHandlers(server, { prefix: "/ws" });

// 서버 시작
server.listen(8080, () => {
  console.log("Server is running on port 8080");
});
