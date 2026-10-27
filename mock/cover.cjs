const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out');
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('force-device-scale-factor', '2');
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1146, height: 717, show: false, frame: false, webPreferences: { contextIsolation: true } });
  win.setContentSize(1146, 717);
  await win.loadFile(path.join(__dirname, 'cover.html'));
  await new Promise(r => setTimeout(r, 1200));
  const img = await win.capturePage();
  fs.writeFileSync(path.join(OUT, 'cover.png'), img.toPNG());
  console.log('cover ' + img.getSize().width + 'x' + img.getSize().height);
  app.quit();
});
