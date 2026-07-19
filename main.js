/* eslint-disable @typescript-eslint/no-require-imports */
const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow;
let nextProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Wait for the Next.js server to be ready before loading the URL
  const loadURL = () => {
    http.get('http://localhost:3000', (res) => {
      if (res.statusCode === 200 || res.statusCode === 307 || res.statusCode === 308) {
        mainWindow.loadURL('http://localhost:3000');
      } else {
        setTimeout(loadURL, 500);
      }
    }).on('error', () => {
      setTimeout(loadURL, 500);
    });
  };

  loadURL();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', () => {
  // Start the Next.js app
  if (app.isPackaged) {
    const serverPath = path.join(process.resourcesPath, 'app', '.next', 'standalone', 'server.js');
    nextProcess = spawn('node', [serverPath], {
      env: { ...process.env, PORT: '3000', NODE_ENV: 'production' }
    });
  } else {
    // In dev, we assume 'npm run dev' is running elsewhere or we spawn it
    nextProcess = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], {
      env: { ...process.env, PORT: '3000' }
    });
  }

  if (nextProcess) {
    nextProcess.stdout.on('data', (data) => console.log(`next: ${data}`));
    nextProcess.stderr.on('data', (data) => console.error(`next error: ${data}`));
  }

  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('quit', () => {
  if (nextProcess) {
    nextProcess.kill();
  }
});
