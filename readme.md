# WebRTC 点对点视频监控

基于 WebRTC 的简易点对点单向视频监控系统，

- 打开网页后，选择拍摄或查看。
- 选择拍摄后，打开本地摄像头，开始传输视频流。
- 另一端选择查看后，开始接收视频流。
- 只能单向实现视频传输，类似于监控摄像。
- 基于 WebRTC 实现点对点通讯，视频流不经过服务器传输，直接在浏览器之间传输。
- 当 2 端不在同一局域网时，可能无法实现视频传输。

# 背景

- 当你需要照看但又不得不短暂离开时，如果你刚好有 2 个手机，你可以使用这个应用。

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
