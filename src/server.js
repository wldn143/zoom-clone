import http from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";
    socket.onAny((event) => {
    console.log(`Socket Event:${event}`);
  });
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname);
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye",socket.nickname));
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname",nickname => (socket["nickname"]=nickname));
});

//const wss = new WebSocketServer({server});
// const sockets=[];
// wss.on("connection", (backSocket) => {
//   sockets.push(backSocket);
//   backSocket["nickname"]="Anon";
//   console.log("Connected to Browser✅");
//   backSocket.on("close", () => console.log("disConnected from browser❌"));
//   backSocket.on("message", (msg) => {
//     const message = JSON.parse(msg);
    
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) =>
//           aSocket.send(`${backSocket.nickname}:${message.payload.toString()}`)
//         );
//         break;
//       case "nickname":
//         backSocket["nickname"] = message.payload.toString();
//         break;
//     }
//   });
// });

httpServer.listen(3000,handleListen);
