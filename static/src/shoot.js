import { io } from "socket.io-client";
import "./style.css";

let localStream;
let peerConnection;
const localVideo = document.getElementById("localVideo");

function log(text) {
  var time = new Date();

  console.log("[" + time.toLocaleTimeString() + "] " + text);
}

function addTrack() {
  // 将本地媒体流添加到对等连接中
  if (peerConnection && localStream) {
    console.log("s1 addTrack: 将本地媒体流添加到对等连接中");
    localStream.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStream);
    });
  }
}
const socket = io.connect(`/`);
socket.on("error", console.error);
function connectSignalingServer() {
  socket.on("connect", () => {
    console.log("Connected to signaling server");
  });
  socket.on("message", (message) => {
    handleSignalingMessage(message);
  });
  socket.on("disconnect", () => {
    console.log("Disconnected from signaling server");
  });

  return socket;
}

// 获取本地媒体流（音频和视频）
function getLocalMediaStream() {
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" }, audio: true })
    .then((stream) => {
      localStream = stream;
      localVideo.srcObject = stream;
      addTrack();
    })
    .catch((error) => {
      console.error("Error accessing media devices: ", error);
    });
}

// 创建对等连接
function createPeerConnection() {
  peerConnection = new RTCPeerConnection();
  console.log("s0 createPeerConnection", peerConnection);

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
    console.log("s3 onicecandidate", event.candidate?.candidate);

    if (event.candidate) {
      // 将ICE候选发送到信令服务器
      socket.emit("message", {
        type: "ice-candidate",
        candidate: event.candidate,
      });
    }
  };

  peerConnection.ontrack = function (event) {
    console.log("ontrack", event.streams[0]);
    const remoteVideo = document.getElementById("remoteVideo");

    remoteVideo.srcObject = event.streams[0];
  };
  peerConnection.onnegotiationneeded = async function (event) {
    console.log("s2 onnegotiationneeded", event);
    log("---> Creating offer");
    const offer = await peerConnection.createOffer();
    if (peerConnection.signalingState != "stable") {
      log("     -- The connection isn't stable yet; postponing...");
      return;
    }
    await peerConnection.setLocalDescription(offer);

    // 将offer发送到信令服务器
    socket.emit("message", {
      type: "offer",
      offer: offer,
    });
  };
}

// 处理信令消息
async function handleSignalingMessage(message) {
  switch (message.type) {
    case "answer":
      // 处理对方发来的answer
      log("s4 处理对方发来的answer on state:", peerConnection.signalingState);
      if (peerConnection.signalingState != "stable") {
        // log("s4 answer rollback");
        // peerConnection.setLocalDescription({ type: "rollback" });
      }
      let answer = new RTCSessionDescription(message.answer);
      try {
        await peerConnection.setRemoteDescription(answer);
      } catch (error) {
        console.error(error);
      }
      break;
    case "ice-candidate":
      // 添加对方发来的ICE候选到对等连接
      log("s5 添加对方发来的ICE候选到对等连接");
      peerConnection.addIceCandidate(new RTCIceCandidate(message.candidate));
      break;
    case "resend_offer":
      log("***resend_offer");
      window.location.reload();
      break;
  }
}

// 初始化函数
function init() {
  createPeerConnection();
  connectSignalingServer();
  getLocalMediaStream();
}

// 页面加载完成后执行初始化
window.onload = init;
