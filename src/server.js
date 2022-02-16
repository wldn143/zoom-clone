import http from "http";
import { WebSocketServer } from 'ws';
import express from "express";
import { Socket } from "dgram";
import { parse } from "path";
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);
const server = http.createServer(app);
const wss = new WebSocketServer({server});

const sockets=[];

wss.on("connection", (backSocket) => {
  sockets.push(backSocket);
  backSocket["nickname"]="Anon";
  console.log("Connected to Browser✅");
  backSocket.on("close", () => console.log("disConnected from browser❌"));
  backSocket.on("message", (msg) => {
    const message = JSON.parse(msg);
    
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(`${backSocket.nickname}:${message.payload.toString()}`)
        );
        break;
      case "nickname":
        backSocket["nickname"] = message.payload.toString();
        break;
    }
  });
});

server.listen(3000,handleListen);
