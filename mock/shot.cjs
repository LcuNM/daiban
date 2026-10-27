const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('force-device-scale-factor', '2');
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1601, height: 1027, show: false, frame: false, webPreferences: { contextIsolation: true } });
  win.setContentSize(1601, 1027);
  for (const st of ['main', 'settings', 'panel', 'gen']) {
    await win.loadURL('file:///' + path.join(__dirname, 'ui.html').replace(/\\/g, '/') + '?st=' + st);
    await new Promise(r => setTimeout(r, 900));
    const img = await win.capturePage();
    const s = img.getSize();
    fs.writeFileSync(path.join(OUT, st + '.png'), img.toPNG());
    console.log('shot ' + st + ' ' + s.width + 'x' + s.height);
  }
  app.quit();
});
