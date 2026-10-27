const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out');
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('force-device-scale-factor', '2');
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1920, height: 1080, show: false, frame: false, webPreferences: { contextIsolation: true } });
  win.setContentSize(1920, 1080);
  await win.loadFile(path.join(__dirname, 'cover_ref.html'));
  await new Promise(r => setTimeout(r, 1500));
  const img = await win.capturePage();
  fs.writeFileSync(path.join(OUT, 'cover_ref.png'), img.toPNG());
  console.log('cover_ref ' + img.getSize().width + 'x' + img.getSize().height);
  app.quit();
});
