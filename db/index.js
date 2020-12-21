const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const _ = require('lodash');
const cohortYaml = path.join(__dirname, 'cohorts.yaml');
const sampleCohortYaml = path.join(__dirname, 'cohorts.sample.yaml');

var activeCohort = '';
var activeStudentCount = 0;
var activeCohortData = [];
var allCohortData = {};

var readYaml = function () {
  // upon first run, may not be a list of students
  // default to sample file, which is in git
  if (!fs.existsSync(cohortYaml) && fs.existsSync(sampleCohortYaml)) {
    console.log(`👀 No student list found. Loading default list. Edit ${cohortYaml} 👀`);
    fs.copyFileSync(sampleCohortYaml, cohortYaml);
  }
  // load from yaml into memory
  var fileContents = fs.readFileSync(cohortYaml, 'utf8');
  allCohortData = yaml.safeLoad(fileContents);
  writeYaml();
};

var writeYaml = function () {
  let yamlDump = yaml.safeDump(allCohortData);
  fs.writeFile(cohortYaml, yamlDump, 'utf8', function (err) {
    if (err) {
      throw ('something broke in writeYaml');
    }
  });
};

var updateCount = function (nextName) {
  var currentCohort = allCohortData.cohorts[activeCohort];
  // change 0 to 1
  currentCohort = currentCohort.map(x => {
    if (x.name === nextName) {
      if (x.count === 0) {
        x.count = 1;
      }
    }
    return x;
  });

  // if everyone is a 1, now they're all 0s again
  if (_.some(currentCohort, function (item) {
    return item.count === 0;
  })) {
    return;
  } else {
    currentCohort = currentCohort.map(x => {
      x.count = 0;
    });
  }
}

orderSelectedStudents = function () {
  activeStudentCount = 0;

  activeCohortData = allCohortData.cohorts[activeCohort].slice();

  let groupedData = _.groupBy(activeCohortData, function (x) {
    return x.count === 0;
  });

  // always put the students who haven't been called on recently first
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

exports.getName = function () {
  let nextName = activeCohortData[activeStudentCount++ % activeCohortData.length].name;
  updateCount(nextName);
  writeYaml();
  return nextName;
};

readYaml();
