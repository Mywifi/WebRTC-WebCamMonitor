const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { log } = require("console");

const app = express();
app.use(cors());
app.use(express.static("static/dist"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.get("/test", (req, res) => {
  res.send("WebRTC Signaling Server");
});
const msgs = {};
const users = [];
let offer;
function logmsg() {
  console.log("-------msgs start-------");
  // deep copy msgs
  const _msgs = JSON.parse(JSON.stringify(msgs));
  for (const key in _msgs) {
    delete _msgs[key]?.offer?.offer?.sdp;
    delete _msgs[key]?.answer?.answer?.sdp;
    console.log(key, _msgs[key]);
  }
  console.log("-------msgs end-------");
  console.log("connected users:", users);
}

io.on("connection", (socket) => {
  console.log("A user connected");
  users.push(socket.id);
  // 接收并处理信令消息
  socket.on("message", (msg) => {
    console.log("Received message:", msg.type, msg?.candidate?.candidate);
    // 将消息转发给相应的对等端
    socket.broadcast.emit("message", msg);
    msgs[socket.id] = msgs[socket.id] || {
      offer: null,
      answer: null,
      "ice-candidate": null,
    };
    msgs[socket.id][msg.type] = msg;
    if (msg.type === "offer") {
      offer = msg;
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    delete msgs[socket.id];
    users.splice(users.indexOf(socket.id), 1);
  });
  socket.on("get_offer", () => {
    console.log("get_offer");
    if (offer) {
      socket.broadcast.emit("message", { type: "resend_offer" });
    }
  });
});
setInterval(() => {
  console.log("connected users:", users);
  logmsg();
}, 60 * 1000);
const port = 12333;
server.listen(port, "0.0.0.0", () => {
  console.log(`Signaling server listening on port ${port}`);
});
