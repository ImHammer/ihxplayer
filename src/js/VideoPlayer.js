
// Global Variables

let controlsVisible = false;
let controlsVisibleTimeout = null;
let lastSelectedVideoFramePosition = null;

let minVideoPlayer = null;
let minVideoPlayerCanvas = null;

let canPlayVideo = false;
let currentVideoUrl = null;
let inFullscreen = false;

//////////////////

const zeroLeft = value => (value < 10 ? `0${value}` : `${value}` );

function hideMouse() {
    $("body").addClass("body-hide-mouse");
}

function showMouse() {
    $("body").removeClass("body-hide-mouse");
}

function parseTimestampSeconds(timestamp) {
    const hours = Math.floor(timestamp / 3600);
    const minutes = Math.floor((timestamp / 60) - (60 * hours));
    const seconds = Math.floor(timestamp % 60);

    return { hours, minutes, seconds }
}

function updatePlayIcon() {
    const videoSrc = $("#video-src");
    if (videoSrc[0].paused) {
        $("#play").html(`<svg xmlns="http://www.w3.org/2000/svg" height="96" viewBox="0 0 24 24" width="96"><path fill="white" d="M8 6.82v10.36c0 .79.87 1.27 1.54.84l8.14-5.18c.62-.39.62-1.29 0-1.69L9.54 5.98C8.87 5.55 8 6.03 8 6.82z"/></svg>`);
    } else {
        $("#play").html(`<svg xmlns="http://www.w3.org/2000/svg" height="96" viewBox="0 0 24 24" width="96"><path fill="white" d="M8 19c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2v10c0 1.1.9 2 2 2zm6-12v10c0 1.1.9 2 2 2s2-.9 2-2V7c0-1.1-.9-2-2-2s-2 .9-2 2z"/></svg>`);
    }
}

function playPauseVideo() {
    const videoSrc = $("#video-src");
    if (videoSrc[0].paused) {
        videoSrc[0].play();
    } else {
        videoSrc[0].pause();
    }
    updatePlayIcon();
}

function setVideoSpeed(speed) {
    const videoSrc = $("#video-src");
    videoSrc[0].playbackRate = speed;
}

function addInCurrentTime(valueAdd) {
    const video = $("#video-src");

    // Esse simples trecho vai impedir que o currentTime fique abaixo de 0, ou acima da duração do video
    video[0].currentTime = Math.min(video[0].duration, Math.max(0, video[0].currentTime + valueAdd));
    video[0].ontimeupdate();
}

function getVideoImage() {
    if (minVideo != null) {

        return videoImage;
    }

    return null;
}

function loadVideoURL(videoUrl, videoTitle, extName) {
    if (currentVideoUrl == videoUrl) return;

    canPlayVideo = false;

    minVideoPlayerCanvas = document.createElement("canvas");

    minVideoPlayer = document.createElement("video");
    minVideoPlayer.crossOrigin = "anonymous";

    const createdSourceMinVideo = document.createElement("source");

    const video = $("#video-src");
    let isFile = true;
    if (videoUrl.startsWith("http://") || videoUrl.startsWith("https://")) isFile = false;

    if (isFile == true) videoUrl = "file://" + videoUrl;

    switch (extName) {
        case ".mp4":
        case ".mkv":
            $("#mp4_src")[0].src = videoUrl;
            createdSourceMinVideo.type = "video/mp4";
        break;
        case ".ogg":
            $("#ogg_src")[0].src = videoUrl;
            createdSourceMinVideo.type = "video/ogg";
        break;
    }

    video[0].load();
    setTimeout(() => video[0].ontimeupdate(), 1200);
    $("#title-container").text(videoTitle);

    minVideoPlayer.onseeked = function () {

        const createdCanvas = document.createElement("canvas");
        createdCanvas.width = minVideoPlayer.videoWidth;
        createdCanvas.height = minVideoPlayer.videoHeight;
        createdCanvas.getContext("2d").drawImage(minVideoPlayer, 0, 0, createdCanvas.width, createdCanvas.height);

        $("#line-show-times img")[0].src = createdCanvas.toDataURL("image/png", 0.2);
    }

    createdSourceMinVideo.src = videoUrl;
    minVideoPlayer.appendChild(createdSourceMinVideo);

    currentVideoUrl = videoUrl;
}

function isEmpty(str) {
    return (!str || str.length === 0 );
}

$(function () {
    // Equivale ao funcionamento de abrir os controles quando mover o mouse
    function newControlsVisibleTimeout() {
        return setTimeout(() => {
            controlsVisible = false;

            $(".controls-content").addClass("hidden-controls-content");
            $("body").addClass("body-hide-mouse");

            clearTimeout(controlsVisibleTimeout);
            controlsVisibleTimeout = null;
        }, 3000);
    }

    function showWhenMouseMove() {
        const controlsContent = $(".controls-content");
        const body = $("body");

        if (controlsContent.hasClass("hidden-controls-content")) controlsContent.removeClass("hidden-controls-content");
        if (body.hasClass("body-hide-mouse")) body.removeClass("body-hide-mouse");

        if (controlsVisibleTimeout != null) clearTimeout(controlsVisibleTimeout);

        controlsVisible = true;
        controlsVisibleTimeout = newControlsVisibleTimeout();
    }

    $(".controls-container").on("mousemove", showWhenMouseMove);

    ////////////////////////////////////////////////////////////////////

    // Atualizando o informativos de tempos do video
    const videoSrc = $("#video-src");

    videoSrc.on("canplay", () => {
        canPlayVideo = true;
    });

    setInterval(() => {
        const videoUrl = $("#video-for-loading .video-url").text();
        if (!isEmpty(videoUrl) && videoUrl !== "n/a") {
            const videoTitle = $("#video-for-loading .video-title").text();
            const videoExt   = $("#video-for-loading .video-ext").text();

            loadVideoURL(videoUrl, videoTitle, videoExt);

            console.log("VIDEO FOR LOADING:", videoUrl, videoTitle, videoExt)

            $("#video-for-loading .video-url").text("n/a");
            $("#video-for-loading .video-title").text("n/a");
            $("#video-for-loading .video-ext").text("n/a");
        }
    }, 500);

    // videoSrc.on("loadeddata", () => {
    //     const videoUrl = $("#video-src")[0].currentSrc;
    //     loadVideoURL(videoUrl);
    // });

    videoSrc[0].ontimeupdate = function () {
        const video = $("#video-src");

        // Em segundos
        const durationTime = video[0].duration;
        const currentTime = video[0].currentTime;

        const { hours: hDuration, minutes: mDuration, seconds: sDuration } = parseTimestampSeconds(durationTime);
        const { hours: hCurrent, minutes: mCurrent, seconds: sCurrent } = parseTimestampSeconds(currentTime);

        let durationTimeStr = zeroLeft(sDuration) + "s";
        if (mDuration > 0 || hDuration > 0) durationTimeStr = zeroLeft(mDuration) + "m " + durationTimeStr;
        if (hDuration > 0) durationTimeStr = zeroLeft(hDuration) + "h " + durationTimeStr;

        let currentTimeStr = zeroLeft(sCurrent) + "s";
        if (mCurrent > 0 || hCurrent > 0) currentTimeStr = zeroLeft(mCurrent) + "m " + currentTimeStr;
        if (hCurrent > 0) currentTimeStr = zeroLeft(mCurrent) + "h " + currentTimeStr;

        $("#duration-video-time").text(durationTimeStr);
        $("#current-video-time").text(currentTimeStr);

        // Atualizando o "Slider" que mostra o tempo decorrido em forma de barra
        const elapsedTimeGradient = 1 / durationTime * currentTime;

        const progressBarBackgroundElem = $("#background-bar");
        const progressBarElem = $("#progress-bar");

        progressBarElem.width(progressBarBackgroundElem.width() * elapsedTimeGradient);
    }
    videoSrc[0].ontimeupdate();

    videoSrc[0].onerror = function failed(e) {
        switch (e.target.error.code) {
            case e.target.error.MEDIA_ERR_ABORTED:
                alert('You aborted the video playback.');
            break;
            case e.target.error.MEDIA_ERR_NETWORK:
                alert('A network error caused the video download to fail part-way.');
            break;
            case e.target.error.MEDIA_ERR_DECODE:
                alert('The video playback was aborted due to a corruption problem or because the video used features your browser did not support.');
            break;
            case e.target.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                alert('The video could not be loaded, either because the server or network failed or because the format is not supported.');
            break;
            default:
                alert('An unknown error occurred.');
            break;
        }
    }

    // Iniciando os botôes de ação
    $("#play").on("click", playPauseVideo);
    $("#turnback").on("click", () => addInCurrentTime(-10));
    $("#forward").on("click", () => addInCurrentTime(10));


    $("#turnback-30").on("click", () => addInCurrentTime(-30));
    $("#forward-30").on("click", () => addInCurrentTime(30));
    $("#forward-90").on("click", () => addInCurrentTime(87));

    $("#video-speed-rate-025").on("click", () => setVideoSpeed(0.25));
    $("#video-speed-rate-050").on("click", () => setVideoSpeed(0.5));
    $("#video-speed-rate-nor").on("click", () => setVideoSpeed(1));
    $("#video-speed-rate-125").on("click", () => setVideoSpeed(1.25));
    $("#video-speed-rate-150").on("click", () => setVideoSpeed(1.5));
    $("#video-speed-rate-200").on("click", () => setVideoSpeed(2));
    $("#video-speed-rate-300").on("click", () => setVideoSpeed(3));

    // Carregando o video test
    // loadVideoURL("/home/danilo/Documentos/ELECTRON/IHxPlayer/src/videoTest.mp4", "videoTest", ".mp4", true);

    // Mostrar o time do video enquanto passa o mouse por cima da barra de progresso
    $("#background-bar").on("mousemove", event => {
        const videoElem = $("#video-src");
        if (canPlayVideo) {
            const lineShowElem = $(".line-show-times");
            const body = $("body");

            let calcMarginValue = event.originalEvent.clientX - (lineShowElem.width() / 2);

            if (calcMarginValue <= 0) calcMarginValue = 0;
            if ((calcMarginValue + lineShowElem.width()) >= body.width()) calcMarginValue = body.width() - lineShowElem.width();

            lineShowElem.css("visibility", "visible");
            lineShowElem.css("margin-left", calcMarginValue);

            const backgroundBar = $("#background-bar");
            const gradient = 1 / backgroundBar.width() * event.originalEvent.offsetX;

            lastSelectedVideoFramePosition = videoElem[0].duration * gradient;

            const { hours, minutes, seconds } = parseTimestampSeconds(Math.floor(lastSelectedVideoFramePosition));

            let timeShow = zeroLeft(seconds);
            if (minutes > 0 || hours > 0) timeShow = zeroLeft(minutes) + ":" + timeShow;
            if (hours > 0) timeShow = zeroLeft(hours) + ":" + timeShow;

            $("#time-line-show").text(timeShow);

            if (minVideoPlayer != null && minVideoPlayerCanvas != null) {
                minVideoPlayer.currentTime = lastSelectedVideoFramePosition;
            }
        }
    });

    $("#background-bar").on("mouseout", () => {
        const lineShowElem = $(".line-show-times");
        lineShowElem.css("visibility", "hidden");

        lastSelectedVideoFramePosition = null;
    });

    $("#background-bar").on("click", () => {
        if (lastSelectedVideoFramePosition != null) {
            videoSrc[0].currentTime = lastSelectedVideoFramePosition;
            videoSrc[0].ontimeupdate();
        }
    });

    // Modo tela cheia
    $("#fullscreen-button").on("click", async () => {
        if (inFullscreen) {
            inFullscreen = false;
            if(document.exitFullscreen) {
                document.exitFullscreen();
            } else if(document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if(document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }

            $("#fullscreen-button").html(`<svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 0 24 24" width="36"><path d="M0 0h24v24H0V0z" fill="none"/><path fill="white" d="M6 14c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1H7v-2c0-.55-.45-1-1-1zm0-4c.55 0 1-.45 1-1V7h2c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1zm11 7h-2c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1s-1 .45-1 1v2zM14 6c0 .55.45 1 1 1h2v2c0 .55.45 1 1 1s1-.45 1-1V6c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1z"/></svg>`);
        } else {
            inFullscreen = true;
            const result = await $("#player-container")[0].requestFullscreen();

            if (result != undefined) console.error(result);

            $("#fullscreen-button").html(`<svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 0 24 24" width="36"><path d="M0 0h24v24H0V0z" fill="none"/><path fill="white" d="M6 16h2v2c0 .55.45 1 1 1s1-.45 1-1v-3c0-.55-.45-1-1-1H6c-.55 0-1 .45-1 1s.45 1 1 1zm2-8H6c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1s-1 .45-1 1v2zm7 11c.55 0 1-.45 1-1v-2h2c.55 0 1-.45 1-1s-.45-1-1-1h-3c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1zm1-11V6c0-.55-.45-1-1-1s-1 .45-1 1v3c0 .55.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1h-2z"/></svg>`);
        }
    });
});

document.addEventListener("keydown", eventKeyDown => {
    if (eventKeyDown.key == "ArrowRight") {
        addInCurrentTime(10);
    } else if (eventKeyDown.key == "ArrowLeft") {
        addInCurrentTime(-10);
    } else if (eventKeyDown.key == "Enter") {
        playPauseVideo();
    }
});
