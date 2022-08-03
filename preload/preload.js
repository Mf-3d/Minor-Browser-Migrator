const electron = require('electron');
electron.contextBridge.exposeInMainWorld('mbm_api', {
  moveData: async (data) => await electron.ipcRenderer.invoke('moveData', data)
});