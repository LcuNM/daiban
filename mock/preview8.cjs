const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const SEGS = require('./segs.js');
const OUT = path.join(__dirname, 'prev');
fs.mkdirSync(OUT, { recursive: true });
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1920, height: 1080, show: false, frame: false, webPreferences: { contextIsolation: true } });
  win.setContentSize(1920, 1080);
  await win.loadFile(path.join(__dirname, 'scene.html'));
  await new Promise(r => setTimeout(r, 400));
  const IMG = 'file:///C:/Users/elysia/.dsh/chat-digest/mock/out/';
  for (const s of SEGS) {
    const data = { idx: s.idx, tag: s.tag, title: s.title, points: s.points, img: IMG + s.img, zoom: s.zoom, focus: s.focus, cap: '示例字幕|第二行示例文字', dur: 12 };
    await win.webContents.executeJavaScript('window.setup(' + JSON.stringify(data) + ')');
    await win.webContents.executeJavaScript('window.setT(1.0)');
    await new Promise(r => setTimeout(r, 120));
    await win.webContents.executeJavaScript('window.setT(3.0)');
    await new Promise(r => setTimeout(r, 420));
    const img = await win.capturePage();
    fs.writeFileSync(path.join(OUT, 'p' + String(s.idx).padStart(2,'0') + '.png'), img.toPNG());
    console.log('prev ' + s.idx);
  }
  app.quit();
});