// マイナーブラウザ間のデータ移行ツール
const electron = require('electron');
const fs = require('fs');
const path = require('path');

/** @type { electron.BrowserWindow } */ let win;

let appDataPath = (process.platform === 'darwin') ? `${require('os').homedir()}/Library/Application Support` : `${require('os').homedir()}\\AppData\\Roaming`;
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

  // --------------------------------
  // 貼り付けるデータをコピーする
  // --------------------------------

  let copy = {};
  if(data.copy === data.paste) return;

  if(data.copy === 'monot'){
    // 設定をコピーする (config.mncfg)
    copy['%_monot_settings'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'monot', 'config.mncfg'), { encoding: 'utf-8' }));

    // ブックマークをコピーする (bookmark.mncfg)
    copy['%_monot_bookmarks'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'monot', 'bookmark.mncfg'), { encoding: 'utf-8' }));
    
    // 履歴をコピーする (history.mndata)
    copy['%_monot_history'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'monot', 'history.mndata'), { encoding: 'utf-8' }));
  } 

  else if(data.copy === 'flune-browser') {
    // 設定、ブックマークなどをコピー
    copy['%_flune_config'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'flune-browser', 'config.json'), { encoding: 'utf-8' }));
  }

  // --------------------------------
  // 貼り付けられるデータをコピーする
  // （バックアップなど）
  // --------------------------------

  let paste = {};

  if(data.paste === 'monot'){
    // 設定をコピーする (config.mncfg)
    paste['%_monot_settings'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'monot', 'config.mncfg'), { encoding: 'utf-8' }));

    // ブックマークをコピーする (bookmark.mncfg)
    paste['%_monot_bookmarks'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'monot', 'bookmark.mncfg'), { encoding: 'utf-8' }));
    
    // 履歴をコピーする (history.mndata)
    paste['%_monot_history'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'monot', 'history.mndata'), { encoding: 'utf-8' }));
  } 

  else if(data.paste === 'flune-browser') {
    // 設定、ブックマークなどをコピー
    paste['%_flune_config'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'flune-browser', 'config.json'), { encoding: 'utf-8' }));
  }

  

  console.log(copy);
});