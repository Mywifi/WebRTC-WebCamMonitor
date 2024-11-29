import { io } from "socket.io-client";
import "./style.css";
// 全局变量
let peerConnection;
function log(text) {
  var time = new Date();

  console.log("[" + time.toLocaleTimeString() + "] " + text);
}
const socket = io.connect(`/`);
socket.on("error", console.error);
function connectSignalingServer() {
  socket.on("connect", () => {
    console.log("Connected to signaling server");
    // 发送offer请求
    socket.emit("get_offer", { a: 1 });
  });
  socket.on("message", (message) => {
    handleSignalingMessage(message);
  });
  socket.on("disconnect", () => {
    console.log("Disconnected from signaling server");
  });

  return socket;
}

// 创建对等连接
function createPeerConnection() {
  peerConnection = new RTCPeerConnection();
  console.log("v0 createPeerConnection", peerConnection);

  peerConnection.onsignalingstatechange = (event) => {
    log(
      "*** WebRTC signaling state changed to: " + peerConnection.signalingState
    );
    switch (peerConnection.signalingState) {
      case "closed":
      case "failed":
      case "disconnected":
        // TODO: handle this case
        break;
    }
  };

  peerConnection.onicecandidate = function (event) {
    console.log("v4 onicecandidate", event.candidate?.candidate);

    if (event.candidate) {
      // 将ICE候选发送到信令服务器
      socket.emit("message", {
        type: "ice-candidate",
        candidate: event.candidate,
      });
    }
  };

  peerConnection.ontrack = function (event) {
    console.log("v2 ontrack", event.streams[0]);
    const remoteVideo = document.getElementById("remoteVideo");

    remoteVideo.srcObject = event.streams[0];
  };
}

// 处理信令消息
function handleSignalingMessage(message) {
  switch (message.type) {
    case "offer":
      // 处理对方发来的offer
      log("v1 处理对方发来的offer");
      let offer = new RTCSessionDescription(message.offer);
      peerConnection.setRemoteDescription(offer).then(() => {
        peerConnection
          .createAnswer()
          .then((answer) => {
            return peerConnection.setLocalDescription(answer);
          })
          .then(() => {
            // 将answer发送到信令服务器
            socket.emit("message", {
              type: "answer",
              answer: peerConnection.localDescription,
            });
          });
      });
      break;

    case "ice-candidate":
      // 添加对方发来的ICE候选到对等连接
      log("v3 添加对方发来的ICE候选到对等连接");
      peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
      break;
  }
}

// 初始化函数
function init() {
  createPeerConnection();
  connectSignalingServer();
}

// 页面加载完成后执行初始化
window.onload = init;
