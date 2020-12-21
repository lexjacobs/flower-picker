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

exports.getName = function () {
  let nextName = activeCohortData[activeStudentCount++ % activeCohortData.length].name;
  updateCount(nextName);
  writeYaml();
  return nextName;
};

readYaml();
