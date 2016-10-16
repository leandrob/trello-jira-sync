'use strict';
require('colors');
const jira = require('./jira');

module.exports = function (jiraProject, keys, transition) {
  let process = keys.map((key) => {
    console.log('Applying transition: ' + transition.yellow + ' to ' + key.green);
    return jira.transitionStory(jiraProject, key, transition)
    .then((r) => r, (err) => console.log('Error updating ' + key.red + ' - ' + err));
  });

  return Promise.all(process).then((res) => res.filter((u) => u).length);
}
