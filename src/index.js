
const { app, BrowserWindow, Menu, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

let defaultWindow = undefined;
let videoPath = null;

function createDefaultWindow() {
    defaultWindow = new BrowserWindow({
        width: 640,
        height: 480,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, "js", "Preload.js")
        }
    });

    defaultWindow.setTitle("IHxPlayer");
    defaultWindow.loadFile(path.join(__dirname, "Player.html"));

    // defaultWindow.webContents.openDevTools();
    defaultWindow.webContents.on("did-finish-load", () => {
        if (videoPath != null) {
            handleOpenVideoFile(videoPath);
        }
    });
}

function handleOpenVideoFile(videoPath) {
    const fileExtension = path.extname(videoPath);
    if (fileExtension == ".mp4" || fileExtension == ".mkv") {
        const fileName = path.basename(videoPath);
        const realFileName = fileName.substring(0, fileName.length - fileExtension.length);

        defaultWindow.webContents.send("open-video-path", videoPath, realFileName, fileExtension);
    }
}

function canReceivedOpenFile() {
    process.argv.forEach((file, index) => {
        try {
            const stats = fs.statSync(file);
            if (stats.isFile()) {
                const fileExtension = path.extname(file);
                if (fileExtension == ".mp4" || fileExtension == ".mkv") {
                    videoPath = file;
                }
            }
        } catch (e) {
            console.error(e);
        }
    });
}
canReceivedOpenFile();

async function openFile() {
    const result = await dialog.showOpenDialog(defaultWindow, {
        title: "Open movie file",
        properties: ["openFile", ""],
        filters: [
            { name: 'Video', extensions: ['mkv', 'mp4', 'webm', 'ogg'] },
        ]
    });

    if (!(result.canceled)) {
        const videoPath = result.filePaths[0];

        try {
            const stats = fs.statSync(videoPath);
            if (stats.isFile()) {
                handleOpenVideoFile(videoPath);
            }
        } catch(excp) {
            console.error(excp);
        }
    }
}

function setApplicationMenu() {
    const templateMenu = [
        {
            "label": "File",
            "submenu": [
                {
                    "label": "Open File",
                    "accelerator": "CommandOrControl+O",
                    "click": openFile
                },
                {
                    "role": "quit"
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(templateMenu));
}

function ready() {
    setApplicationMenu();
    createDefaultWindow();
}

function activate() {
    if (BrowserWindow.getAllWindows().length < 1) createDefaultWindow();
}

app.on("ready", ready);
app.on("activate", activate);
