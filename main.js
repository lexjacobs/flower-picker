const { app, Menu, Tray } = require('electron')
const { initDb, getName, listGroups, setGroup } = require('./db');
let tray = null;

var quitApp = function () {
  process.exit(0);
}

var buildInitialMenu = function () {

  var handleGroupSelection = function (menuItem) {
    setGroup(menuItem.label);
    setNewName();
  }

  initDb(function () {

    var initialMenuChoices = listGroups().map(group => {
      return { label: group, type: 'normal', click: handleGroupSelection }
    }).concat({type: 'separator'}, { label: 'quit app', type: 'normal', click: quitApp })

    var contextMenu = Menu.buildFromTemplate(initialMenuChoices);
    tray.setToolTip('Click to set group');
    tray.setContextMenu(contextMenu);
    tray.setTitle('pick group', {
      fontType: "monospacedDigit"
    });
  })

};

var setNewName = function (menuItem) {
  getName(function (name) {
    contextMenu = Menu.buildFromTemplate([
      { label: `select new name`, type: 'normal', click: setNewName },
      { type: 'separator' },
      { label: 'pick new group', type: 'normal', click: buildInitialMenu },
      { type: 'separator' },
      { label: 'quit app', type: 'normal', click: quitApp }
    ])
    tray.setContextMenu(contextMenu);
    tray.setTitle(name, {
      fontType: "monospacedDigit"
    });
  });
}

app.whenReady().then(() => {
  console.log(`App running in menu bar. Click to interact 🚀`);

  tray = new Tray('./flower.png', 'd3392b5f-4037-494e-b49a-48d2a80cd656');
  buildInitialMenu();
});
