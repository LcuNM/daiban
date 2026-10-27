const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('digest', {
  load: () => ipcRenderer.invoke('state:load'),
  savePoint: (point) => ipcRenderer.invoke('points:save', point),
  deletePoint: (id) => ipcRenderer.invoke('points:delete', id),
  saveConfig: (config) => ipcRenderer.invoke('config:save', config),
  listChats: (keyword) => ipcRenderer.invoke('chats:list', keyword),
  openData: () => ipcRenderer.invoke('shell:open-data'),
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),
  paths: () => ipcRenderer.invoke('app:paths'),
  pickMedia: (kind) => ipcRenderer.invoke('media:pick', kind),
  runDigest: (days) => ipcRenderer.invoke('digest:run', days),
});
