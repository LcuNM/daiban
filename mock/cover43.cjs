const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out');
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('force-device-scale-factor', '2');
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1200, height: 900, show: false, frame: false, webPreferences: { contextIsolation: true } });
  win.setContentSize(1200, 900);
  await win.loadFile(path.join(__dirname, 'cover43.html'));
  await new Promise(r => setTimeout(r, 1200));
  const img = await win.capturePage();
  fs.writeFileSync(path.join(OUT, 'cover43.png'), img.toPNG());
  console.log('cover43 ' + img.getSize().width + 'x' + img.getSize().height);
  app.quit();
});
