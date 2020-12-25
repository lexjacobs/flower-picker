const path = require('path');
const { Menu, Tray } = require('electron');
const { getName, listGroups, setGroup } = require('../db');

let tray;

var quitApp = () => { process.exit(0); };


var addMenubarTitle = (text) => {
  tray.setTitle(text, {
    fontType: 'monospacedDigit'
  });
};

var handleGroupSelection = (menuItem) => {
  setGroup(menuItem.label);
  setNewName();
};

var buildInitialMenu = () => {
  var initialMenuChoices = listGroups().map(group => {
    return { label: group, type: 'normal', click: handleGroupSelection };
  }).concat({type: 'separator'}, { label: 'quit app', type: 'normal', click: quitApp });
  var contextMenu = Menu.buildFromTemplate(initialMenuChoices);
  tray.setToolTip('Click to set group');
  tray.setContextMenu(contextMenu);
  addMenubarTitle('pick group');
};

var setNewName = () => {
  getName(name => {
    var contextMenu = Menu.buildFromTemplate([
      { label: 'select new name', type: 'normal', click: setNewName },
      { type: 'separator' },
      { label: 'pick new group', type: 'normal', click: buildInitialMenu },
      { type: 'separator' },
      { label: 'quit app', type: 'normal', click: quitApp }
    ]);
    tray.setContextMenu(contextMenu);
    addMenubarTitle(name);
  });
};

exports.initTray = () => {
  tray = new Tray(path.join(__dirname, '../flower.png'), 'd3392b5f-4037-494e-b49a-48d2a80cd656');
  buildInitialMenu();
};
