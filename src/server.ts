// import cors from "cors";
// import express from "express";
// import { createServer } from "http";
// import sockjs from "sockjs";

// // Express 앱 생성
// const app = express();
// app.use(
//   cors({
//     origin: "http://localhost:3000", // 클라이언트의 출처를 명시
//     credentials: true, // 자격 증명 허용
//   })
// );

// // HTTP 서버 생성
// const server = createServer(app);

// // SockJS 서버 생성
// const sockjsServer = sockjs.createServer({ prefix: "/ws" });

// // STOMP 메시지 핸들러 설정
// sockjsServer.on("connection", (conn: sockjs.Connection) => {
//   console.log("Client connected");

//   conn.write(
//     JSON.stringify({
//       command: "CONNECTED",
//       message: "Connection successful",
//     })
//   );

//   conn.on("data", (message: string) => {
//     console.log("Received message:", message);
//     try {
//       // 클라이언트에 "CONNECTED" 메시지 전송
//       conn.write(
//         JSON.stringify({
//           command: "CONNECTED",
//           message: "Connection successful",
//         })
//       );
//     } catch (e) {
//       console.error("Failed to send message:", e);
//     }
//   });

//   conn.on("close", () => {
//     console.log("Client disconnected");
//   });
// });

// // SockJS 서버와 HTTP 서버 연결
// sockjsServer.installHandlers(server, { prefix: "/ws" });

// // 서버 시작
// server.listen(8080, () => {
//   console.log("Server is running on port 8080");
// });

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
  console.log("Client connected");

  console.log("conn", conn);

  conn.on("data", (message: string) => {
    console.log("Received message:", message);
    try {
      const frame = parseStompFrame(message);
      console.log("Parsed STOMP frame:", frame);
      handleStompFrame(conn, frame);
    } catch (e) {
      console.error("Failed to handle message:", e);
    }
  });

  conn.on("close", () => {
    console.log("Client disconnected");
  });
});

// STOMP 프레임 파싱 함수
function parseStompFrame(message: string) {
  const lines = message.split("\n");
  const command = lines[0];
  const headers: Record<string, string> = {};
  let body = "";

  let i = 1;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line === "") break;
    const [key, value] = line.split(":");
    headers[key.trim()] = value.trim();
  }

  body = lines.slice(i + 1).join("\n");

  return { command, headers, body };
}

// STOMP 프레임 처리 함수
function handleStompFrame(
  conn: sockjs.Connection,
  frame: { command: string; headers: Record<string, string>; body: string }
) {
  switch (frame.command) {
    case "CONNECT":
      conn.write("CONNECTED\nversion:1.2\n\n\0");
      console.log("STOMP client connected");
      break;
    case "SEND":
      console.log("STOMP message sent:", frame.body);
      // 여기서 메시지 브로커나 다른 클라이언트로 메시지를 전달할 수 있습니다.
      break;
    case "SUBSCRIBE":
      console.log("STOMP client subscribed:", frame.headers.destination);
      // 구독 처리 로직 추가
      break;
    case "DISCONNECT":
      conn.write(
        "RECEIPT\nreceipt-id:" + frame.headers["receipt-id"] + "\n\n\0"
      );
      console.log("STOMP client disconnected");
      conn.close();
      break;
    default:
      console.log("Unknown STOMP command:", frame.command);
  }
}

// SockJS 서버와 HTTP 서버 연결
sockjsServer.installHandlers(server, { prefix: "/ws" });

// 서버 시작
server.listen(8080, () => {
  console.log("Server is running on port 8080");
});
