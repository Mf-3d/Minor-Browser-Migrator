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
    copy['%_monot_bookmarks'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'monot', 'bookmark.mndata'), { encoding: 'utf-8' }));
    
    // 履歴をコピーする (history.mndata)
    copy['%_monot_history'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'monot', 'history.mndata'), { encoding: 'utf-8' }));
  } 

  else if(data.copy === 'flune-browser') {
    // 設定、ブックマークなどをコピー
    copy['%_flune_config'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'flune-browser', 'config.json'), { encoding: 'utf-8' }));
  }

  // --------------------------------
  // 貼り付けられるデータをコピーする
  // （バックアップなどに使う）
  // --------------------------------

  let paste = {};

  if(data.paste === 'monot'){
    // 設定をコピーする (config.mncfg)
    paste['%_monot_settings'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'monot', 'config.mncfg'), { encoding: 'utf-8' }));

    // ブックマークをコピーする (bookmark.mncfg)
    paste['%_monot_bookmarks'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'monot', 'bookmark.mndata'), { encoding: 'utf-8' }));
    
    // 履歴をコピーする (history.mndata)
    paste['%_monot_history'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'monot', 'history.mndata'), { encoding: 'utf-8' }));
  } 

  else if(data.paste === 'flune-browser') {
    // 設定、ブックマークなどをコピー
    paste['%_flune_config'] = JSON.parse(fs.readFileSync(path.join(appDataPath, 'flune-browser', 'config.json'), { encoding: 'utf-8' }));
  }

  moveData(copy, paste);
});

/** 
 * @param {{
 *    '%_monot_settings': any;
 *    '%_monot_bookmarks': any;
 *    '%_monot_history': any;
 *    '%_flune_config': any;
 * }} copy
 * @param {{
 *    '%_monot_settings': any;
 *    '%_monot_bookmarks': any;
 *    '%_monot_history': any;
 *    '%_flune_config': any;
 * }} paste
 */
function moveData (copy, paste) {
  const unificationSettings = {
    windowSize: [900, 800],
    bookmark: [],
    history: [],

    // ブラウザー独自の項目
    unique: {}
  }

  let unificationCopy = {
    windowSize: [900, 800],
    bookmark: [],
    history: [],

    // ブラウザー独自の項目
    unique: {}
  }

  let unificationPaste = {
    windowSize: [900, 800],
    bookmark: [],
    history: [],

    // ブラウザー独自の項目
    unique: {}
  }

  // --------------------------------
  // コピーするデータを共通の形式に変更する
  // --------------------------------
  if (copy['%_monot_settings']) {
    unificationCopy.windowSize = [copy['%_monot_settings'].width, copy['%_monot_settings'].height];

    unificationCopy.unique.monot = {};

    unificationCopy.unique.monot.experiments = copy['%_monot_settings'].experiments;
    unificationCopy.unique.monot.startup = copy['%_monot_settings'].startup;
    unificationCopy.unique.monot.ui = copy['%_monot_settings'].ui;
  }

  if (copy['%_monot_bookmarks']) {
    unificationCopy.unique.monot.bookmark = [];

    copy['%_monot_bookmarks'].forEach((bookmark) => {
      unificationCopy.bookmark[unificationCopy.bookmark.length] = {
        title: bookmark.pageTitle,
        url: bookmark.pageUrl
      }

      unificationCopy.unique.monot.bookmark = [];

      unificationCopy.unique.monot.bookmark[unificationCopy.unique.monot.bookmark.length] = bookmark;
    });
  }

  if (copy['%_monot_history']) {
    unificationCopy.unique.monot.history = [];

    copy['%_monot_history'].forEach((history) => {
      unificationCopy.history[unificationCopy.history.length] = {
        title: history.pageTitle,
        url: history.pageUrl
      }

      unificationCopy.unique.monot.history = [];

      unificationCopy.unique.monot.history[unificationCopy.unique.monot.history.length] = history;
    });
  }

  if (copy['%_flune_config']) {
    unificationCopy.windowSize = copy['%_flune_config'].window.window_size;

    unificationCopy.bookmark = copy['%_flune_config'].bookmark;

    unificationCopy.history = copy['%_flune_config'].history;
    
    unificationCopy.unique.flune = {};

    unificationCopy.unique.flune.force_twemoji = copy['%_flune_config'].settings.force_twemoji;
    unificationCopy.unique.flune['use-home-button'] = copy['%_flune_config'].settings['use-home-button'];
    unificationCopy.unique.flune.theme = copy['%_flune_config'].settings.theme;
    unificationCopy.unique.flune['setting-auto-save'] = copy['%_flune_config'].settings['setting-auto-save'];
  }

  // -----------------------------------
  // ペーストするデータを共通の形式に変更する
  // -----------------------------------
  if (paste['%_monot_settings']) {
    unificationPaste.windowSize = [paste['%_monot_settings'].width, paste['%_monot_settings'].height];

    unificationPaste.unique.monot = {};

    unificationPaste.unique.monot.experiments = paste['%_monot_settings'].experiments;
    unificationPaste.unique.monot.startup = paste['%_monot_settings'].startup;
    unificationPaste.unique.monot.ui = paste['%_monot_settings'].ui;
  }

  if (paste['%_monot_bookmarks']) {
    unificationPaste.unique.monot.bookmark = [];

    paste['%_monot_bookmarks'].forEach((bookmark) => {
      unificationPaste.bookmark[unificationPaste.bookmark.length] = {
        title: bookmark.pageTitle,
        url: bookmark.pageUrl
      }

      unificationPaste.unique.monot.bookmark[unificationPaste.unique.monot.bookmark.length] = bookmark;
    });
  }

  if (paste['%_monot_history']) {
    unificationPaste.unique.monot.history = [];

    paste['%_monot_history'].forEach((history) => {
      unificationPaste.history[unificationPaste.history.length] = {
        title: history.pageTitle,
        url: history.pageUrl
      }

     

      unificationPaste.unique.monot.history[unificationPaste.unique.monot.history.length] = history;
    });
  }

  if (paste['%_flune_config']) {
    unificationPaste.windowSize = paste['%_flune_config'].window.window_size;

    unificationPaste.bookmark = paste['%_flune_config'].bookmark;

    unificationPaste.history = paste['%_flune_config'].history;
    
    unificationPaste.unique.flune = {};

    unificationPaste.unique.flune.force_twemoji = paste['%_flune_config'].settings.force_twemoji;
    unificationPaste.unique.flune['use-home-button'] = paste['%_flune_config'].settings['use-home-button'];
    unificationPaste.unique.flune.theme = paste['%_flune_config'].settings.theme;
    unificationPaste.unique.flune['setting-auto-save'] = paste['%_flune_config'].settings['setting-auto-save'];
  }

  console.log(unificationCopy);
  console.log(unificationPaste);
}