const path = require('path');
const _ = require('lodash');
const { Menu, Tray } = require('electron');
const { persistData } = require('../db');

let tray;
let studentGroups;

var quitApp = () => { process.exit(0); };

var addMenubarTitle = (text) => {
  tray.setTitle(text, {
    fontType: 'monospacedDigit'
  });
};

var handleGroupSelection = (menuItem) => {
  buildNameSelectMenu();
  studentGroups.setGroup(menuItem.label);
  setNewName();
};

var buildGroupSelectMenu = () => {
  var initialMenuChoices = studentGroups.listGroups().map(group => {
    return { label: group, type: 'normal', click: handleGroupSelection };
  }).concat({type: 'separator'}, { label: 'quit app', type: 'normal', click: quitApp });
  var contextMenu = Menu.buildFromTemplate(initialMenuChoices);
  tray.setContextMenu(contextMenu);
  addMenubarTitle('pick group');
};

var buildNameSelectMenu = () => {
  var contextMenu = Menu.buildFromTemplate([
    { label: 'select new name', type: 'normal', click: setNewName },
    { type: 'separator' },
    { label: 'pick new group', type: 'normal', click: buildGroupSelectMenu },
    { type: 'separator' },
    { label: 'quit app', type: 'normal', click: quitApp }
  ]);
  tray.setContextMenu(contextMenu);
};

var setNewName = () => {
  studentGroups.getName(name => addMenubarTitle(name));
};

class StudentGroups {
  constructor (data) {
    this.activeGroup = '';
    this.activeNameCount = 0;
    this.activeGroupData = [];
    this.allGroupData = data;
  }
  flipPicksIfAllTrue (currentGroup) {
    // if everyone was recently picked, now they're all reset
    if (_.some(currentGroup, (person) => {
      return person.recentPick === false;
    })) {
      return;
    } else {
      currentGroup = currentGroup.map(person => {
        person.recentPick = false;
      });
    }
  }
  getName (cb) {
    let nextName = this.activeGroupData[this.activeNameCount++ % this.activeGroupData.length].name;
    this.setRecentPick(nextName);
    cb(nextName);
    persistData(this.allGroupData, (err) => {
      if (err) {
        throw (err);
      }
    });
  }
  listGroups () {
    return Object.keys(this.allGroupData.groups);
  }
  orderSelectedStudents () {
    this.activeNameCount = 0;
    this.activeGroupData = this.allGroupData.groups[this.activeGroup].slice();
    let groupedData = _.groupBy(this.activeGroupData, (person) => {
      return person.recentPick === false;
    });
    // always put the students who aren't a recentPick first
    let shuffledData = _.shuffle(groupedData[true]).concat(_.shuffle(groupedData[false]));
    this.activeGroupData = shuffledData;
  }
  setGroup  (group) {
    this.activeGroup = group;
    this.orderSelectedStudents();
  }
  setRecentPick (nextName)  {
    var currentGroup = this.allGroupData.groups[this.activeGroup];
    // iterate name objects and set recentPick to true
    currentGroup = currentGroup.map(person => {
      if (person.name === nextName) {
        person.recentPick = true;
      }
      return person;
    });
    this.flipPicksIfAllTrue(currentGroup);
  }
}

exports.initTray = (data) => {
  tray = new Tray(path.join(__dirname, '../flower.png'), 'd3392b5f-4037-494e-b49a-48d2a80cd656');
  studentGroups = new StudentGroups(data);
  buildGroupSelectMenu();
};
