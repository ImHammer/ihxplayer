
const { ipcRenderer } = require("electron");

ipcRenderer.on("open-video", (event, videoPath) => {
    console.log("Video path")
});
