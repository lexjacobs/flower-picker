const { app, Menu, Tray } = require('electron')
const { initDb, getName, listCohorts, setCohort } = require('./db');
let tray = null;

var quitApp = function () {
  process.exit(0);
}

var buildInitialMenu = function () {

  var handleCohortSelection = function (menuItem) {
    setCohort(menuItem.label);
    setNewName();
  }

  initDb(function () {

    var initialMenuChoices = listCohorts().map(cohort => {
      return { label: cohort, type: 'normal', click: handleCohortSelection }
    }).concat({type: 'separator'}, { label: 'quit app', type: 'normal', click: quitApp })

    var contextMenu = Menu.buildFromTemplate(initialMenuChoices);
    tray.setToolTip('Click to set cohort');
    tray.setContextMenu(contextMenu);
    tray.setTitle('pick cohort', {
      fontType: "monospacedDigit"
    });
  })

};

var setNewName = function (menuItem) {
  getName(function (name) {
    contextMenu = Menu.buildFromTemplate([
      { label: `select new name`, type: 'normal', click: setNewName },
      { type: 'separator' },
      { label: 'pick new cohort', type: 'normal', click: buildInitialMenu },
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

  tray = new Tray('./flower.png', '14e25de8-22f5-447d-900a-bb415c3d5459');
  buildInitialMenu();
});
