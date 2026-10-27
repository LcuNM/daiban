const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, 'out');
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('force-device-scale-factor', '1.5');
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: 1600, height: 900, show: false, frame: false, webPreferences: { contextIsolation: true } });
  win.setContentSize(1600, 900);
  await win.loadFile(path.join(__dirname, 'cover169.html'));
  await new Promise(r => setTimeout(r, 1200));
  const img = await win.capturePage();
  fs.writeFileSync(path.join(OUT, 'cover169.png'), img.toPNG());
  console.log('cover169 ' + img.getSize().width + 'x' + img.getSize().height);
  app.quit();
});
