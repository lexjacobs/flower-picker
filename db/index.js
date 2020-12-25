const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const _ = require('lodash');
const groupsYaml = path.join(__dirname, 'groups.yaml');
const sampleGroupsYaml = path.join(__dirname, 'groups.sample.yaml');

var activeGroup = '';
var activeNameCount = 0;
var activeGroupData = [];
var allGroupData = {};

var fileExists = (path) => {
  return fs.existsSync(path);
};

var readYaml = (filePath, cb) => {
  // load from yaml into memory
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      cb(err);
    } else {
      // return in-memory object
      cb(null, yaml.safeLoad(data));
    }
  });
};

var writeYaml = (data, filePath, cb) => {
  fs.writeFile(filePath, yaml.safeDump(data), 'utf8', (err) => {
    if (err) {
      cb(err);
    } else {
      cb(null, true);
    }
  });
};

var updateCount = (nextName) => {
  var currentGroup = allGroupData.groups[activeGroup];
  // change false to true
  currentGroup = currentGroup.map(person => {
    if (person.name === nextName) {
      if (person.recentPick === false) {
        person.recentPick = true;
      }
    }
    return person;
  });

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
};

var orderSelectedStudents = () => {
  activeNameCount = 0;

  activeGroupData = allGroupData.groups[activeGroup].slice();

  let groupedData = _.groupBy(activeGroupData, (person) => {
    return person.recentPick === false;
  });

  // always put the students who aren't a recentPick first
  let shuffledData = _.shuffle(groupedData[true]).concat(_.shuffle(groupedData[false]));

  activeGroupData = shuffledData;
};

exports.listGroups = () => {
  return Object.keys(allGroupData.groups);
};

exports.setGroup = (group) => {
  activeGroup = group;
  orderSelectedStudents();
};

exports.getName = (cb) => {
  let nextName = activeGroupData[activeNameCount++ % activeGroupData.length].name;
  updateCount(nextName);
  cb(nextName);
  writeYaml(allGroupData, groupsYaml, (err) => {
    if (err) {
      throw (err);
    }
  });
};

// initialize in-memory data
exports.initDb = (cb) => {
  var readSource = groupsYaml;
  if (!fileExists(groupsYaml) && fileExists(sampleGroupsYaml)) {
    console.log(`👀 No groups data found. Loading sample data. Edit ${groupsYaml} 👀`);
    readSource = sampleGroupsYaml;
  }
  readYaml(readSource, (err, data) => {
    if (err) {
      throw ('error reading sample groups yaml');
    } else {
      allGroupData = data;
      cb();
      writeYaml(allGroupData, groupsYaml, (err) => {
        if (err) {
          throw (`error writing yaml to ${groupsYaml}`);
        }
      });
    }
  });

};
