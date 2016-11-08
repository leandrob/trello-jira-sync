'use strict';
require('colors');
const jira = require('./jira');

module.exports = function (keys, comment) {
  let process = keys.map((key) => {
    console.log('Adding comment: ' + comment.yellow + ' to ' + key.green);
    return jira.addComment(key, comment)
    .then((r) => r, (err) => console.log('Error updating ' + key.red + ' - ' + err));
  });

  return Promise.all(process).then((res) => res.filter((u) => u).length);
}
