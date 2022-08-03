// マイナーブラウザ間のデータ移行ツール
const electron = require('electron');

/** @type { electron.BrowserWindow } */ let win;

let appDataPath = (process.platform === 'darwin') ? `${require('os').homedir()}/Library/Application Support` : `${require('os').homedir()}/a`;
console.log(appDataPath);
function nw () {
  win = new electron.BrowserWindow({
    width: 700,
    height: 400,
    minWidth: 400,
    minHeight: 400,
    title: 'Minor-Browser Migrator',
    webPreferences: {
      preload: `${__dirname}/preload/preload.js`
    }
  });

  if(process.platform === 'win32') {
    win.setMenuBarVisibility(false);
  }

  win.loadFile(`${__dirname}/views/index.html`);
}

electron.app.on('ready', () => { 
  nw(); 
});

electron.ipcMain.handle('moveData', 
/** 
 * @param {{copy: 'monot' | 'flune-browser', paste: 'monot' | 'flune-browser'}} data
 */
(event, data) => {
  console.log(data);

  if(data.copy === data.paste) return;

  if(data.copy === 'monot'){
    console.log(`${appDataPath}/monot`);
  } else if(data.copy === 'flune-browser') {
    console.log(`${appDataPath}/flune-browser`);
  }
});