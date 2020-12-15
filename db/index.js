var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var _ = require('lodash');

var activeCohort = '';
var activeCohortCount = 0;
var activeCohortData = [];
var data;

var readYaml = function () {
  // upon first run, may not be a list of students
  // default to sample file, which is in git
  if (!fs.existsSync(path.join(__dirname, 'cohorts.yaml')) && fs.existsSync(path.join(__dirname, 'cohorts.yaml.bak'))) {
    fs.copyFileSync(path.join(__dirname, 'cohorts.sample.yaml'), path.join(__dirname, 'cohorts.yaml'));
  }
  // load from yaml into memory
  var fileContents = fs.readFileSync(path.join(__dirname, 'cohorts.yaml'), 'utf8');
  data = yaml.safeLoad(fileContents);
  writeYaml();
};

var writeYaml = function () {
  let yamlDump = yaml.safeDump(data);
  fs.writeFile(path.join(__dirname, 'cohorts.yaml'), yamlDump, 'utf8', function (err) {
    if (err) {
      throw ('something broke in writeYaml');
    }
  });
};

var updateCount = function (nextName) {
  var currentCohort = data.cohorts[activeCohort];
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
  activeCohortCount = 0;

  activeCohortData = data.cohorts[activeCohort].slice();

  let groupedData = _.groupBy(activeCohortData, function (x) {
    return x.count === 0;
  });

  // always put the students who haven't been called on recently first
  let shuffledData = _.shuffle(groupedData[true]).concat(_.shuffle(groupedData[false]));

  console.log(`shuffleddata ${JSON.stringify(shuffledData)}`);
  activeCohortData = shuffledData;
};

exports.listCohorts = function () {
  return Object.keys(data.cohorts);
}

exports.setCohort = function (cohort) {
  activeCohort = cohort;
  orderSelectedStudents();
}

exports.getName = function () {
  let nextName = activeCohortData[activeCohortCount++ % activeCohortData.length].name;
  updateCount(nextName);
  writeYaml();
  return nextName;
};

readYaml();
