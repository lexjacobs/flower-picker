const { app } = require('electron');
const { initDb } = require('./db');
const { initTray } = require('./views/tray');

app.whenReady().then(() => {
  initDb((err, data) => {
    if (err) {
      throw(err);
    }
    initTray(data);
    console.log('App running in menu bar. Click to interact 🚀');
    console.log('edit group lists in ./db/groups.yaml');
  });
});
