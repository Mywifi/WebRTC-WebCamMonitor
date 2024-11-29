[中文](README_CN.md)

# WebRTC p2p video monitoring page
Simple p2p one-way WebCam monitoring page based on WebRTC

- After opening the webpage, choose to shoot or view.

- After choosing to shoot, open the local camera and start transmitting the video stream.

- After the other end chooses to view, it starts receiving the video stream.

- Video transmission can only be achieved in one direction, similar to monitoring cameras.

- Based on WebRTC, p2p communication is achieved. The video stream is not transmitted through the server, but directly transmitted between browsers.

- When the two ends are not in the same LAN, video transmission may not be achieved.

# Background

- When you need to look after but have to leave for a short time, if you happen to have 2 mobile phones, you can use this application.

# run

```sh
node server.js
```

# dev

```sh
cd static
```

```sh
npm run start
```

# publish

```sh
npm run build
```
