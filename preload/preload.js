const electron = require('electron');
electron.contextBridge.exposeInMainWorld('mdm_api', {
  moveData: async (data) => await electron.ipcRenderer.invoke('moveData', data)
});