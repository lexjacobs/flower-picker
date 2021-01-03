const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const groupsYaml = path.join(__dirname, 'groups.yaml');
// const sampleGroupsYaml = path.join(__dirname, 'groups.sample.yaml');

// var fileExists = (path) => {
//   return fs.existsSync(path);
// };

// read .yaml file
const readYaml = (filePath, cb) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      cb(err);
    } else {
      // invoke cb with safeLoaded in-memory object
      cb(null, yaml.safeLoad(data));
    }
  });
};

const writeYaml = (data, filePath, cb) => {
  // convert in-memory data
  // and write to .yaml file
  fs.writeFile(filePath, yaml.safeDump(data), 'utf8', (err) => {
    if (err) {
      cb(err);
    }
  });
};

exports.persistData = (data, cb) => {
  writeYaml(data, groupsYaml, cb);
};

exports.initDb = (cb) => {
  readYaml(groupsYaml, (err, data) => {
    if (err) {
      cb(err);
    } else {
      cb(null, data);
    }
  });
};
