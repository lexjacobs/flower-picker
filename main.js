const { app } = require('electron');
const { initDb } = require('./db');
const { initTray } = require('./views/tray');

app.whenReady().then(() => {
  initDb(() => {
    initTray();
    console.log('App running in menu bar. Click to interact 🚀');
  });
});
