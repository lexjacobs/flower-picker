const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const _ = require('lodash');
const { sample } = require('lodash');
const cohortYaml = path.join(__dirname, 'cohorts.yaml');
const sampleCohortYaml = path.join(__dirname, 'cohorts.sample.yaml');

var activeCohort = '';
var activeStudentCount = 0;
var activeCohortData = [];
var allCohortData = {};

var fileExists = function (path) {
  return fs.existsSync(path);
}

var readYaml = function (filePath, cb) {
  // load from yaml into memory
  var fileContents = fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
      cb(err);
    } else {
      // return in-memory object
      cb(null, yaml.safeLoad(data));
    }
  });
};

var writeYaml = function (data, filePath, cb) {
  fs.writeFile(filePath, yaml.safeDump(data), 'utf8', function (err) {
    if (err) {
      cb(err);
    } else {
      cb(null, true);
    }
  });
}

// var writeYaml = function () {
//   let yamlDump = yaml.safeDump(allCohortData);
//   fs.writeFile(cohortYaml, yamlDump, 'utf8', function (err) {
//     if (err) {
//       throw ('something broke in writeYaml');
//     }
//   });
// };

var updateCount = function (nextName) {
  var currentCohort = allCohortData.cohorts[activeCohort];
  // change false to true
  currentCohort = currentCohort.map(person => {
    if (person.name === nextName) {
      if (person.recentPick === false) {
        person.recentPick = true;
      }
    }
    return person;
  });

  // if everyone was recently picked, now they're all reset
  if (_.some(currentCohort, function (person) {
    return person.recentPick === false;
  })) {
    return;
  } else {
    currentCohort = currentCohort.map(person => {
      person.recentPick = false;
    });
  }
}

orderSelectedStudents = function () {
  activeStudentCount = 0;

  activeCohortData = allCohortData.cohorts[activeCohort].slice();

  let groupedData = _.groupBy(activeCohortData, function (person) {
    return person.recentPick === false;
  });

  // always put the students who aren't a recentPick first
  let shuffledData = _.shuffle(groupedData[true]).concat(_.shuffle(groupedData[false]));

  activeCohortData = shuffledData;
};

exports.listCohorts = function () {
  return Object.keys(allCohortData.cohorts);
}

exports.setCohort = function (cohort) {
  activeCohort = cohort;
  orderSelectedStudents();
}

exports.getName = function (cb) {
  let nextName = activeCohortData[activeStudentCount++ % activeCohortData.length].name;
  updateCount(nextName);
  writeYaml(allCohortData, cohortYaml, function(err) {
    if (err) {
      cb(err);
    } else {
      cb(null, nextName);
    }
  });
};

// initialize in-memory data
exports.initDb = function (cb) {
  var readSource = cohortYaml;
  if (!fileExists(cohortYaml) && fileExists(sampleCohortYaml)) {
    console.log(`👀 No student list found. Loading sample list. Edit ${cohortYaml} 👀`);
    readSource = sampleCohortYaml;
  }
  readYaml(readSource, function (err, data) {
    if (err) {
      throw ('error reading sample cohort yaml');
    } else {
      allCohortData = data;
      writeYaml(allCohortData, cohortYaml, function (err) {
        if (err) {
          throw (`error writing yaml to ${cohortYaml}`);
        } else {
          cb();
        }
      });
    }
  });

};
