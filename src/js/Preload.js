const { ipcRenderer } = require("electron");

function loadVideoURL(videoUrl, videoTitle, extName) {
    console.log("Para loading:", videoUrl, videoTitle, extName);

    document.getElementById("load-video-url").innerText = videoUrl;
    document.getElementById("load-video-title").innerText = videoTitle;
    document.getElementById("load-video-ext").innerText = extName;

    // const video = document.getElementById("video-src");
    //
    // if (isFile == true) videoUrl = "file://" + videoUrl;
    // switch (extName) {
    //     case ".mp4":
    //     case ".mkv":
    //         document.getElementById("mp4_src").src = videoUrl;
    //     break;
    //     case ".ogg":
    //         document.getElementById("ogg_src").src = videoUrl;
    //     break;
    // }
    //
    // video.load();
}

ipcRenderer.on("open-video-path", (event, videoPath, fileName, extName) => {
    loadVideoURL(videoPath, fileName, extName);
});
