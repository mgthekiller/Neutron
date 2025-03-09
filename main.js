const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    let win = new BrowserWindow({
        width: 1280,
        height: 720,
        webPreferences: {
            nodeIntegration: true
        }
    });

    win.loadFile(path.join(__dirname, 'index.html' )); // تحميل موقعك
}

app.whenReady().then(createWindow);
