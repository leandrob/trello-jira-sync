'use strict';
const jira = require('./jira');

module.exports = function (jiraProject, epics) {
  let process = epics.map((epic) => {
    console.log('Creating Epic: ' + epic);
    return jira.createEpic(jiraProject, epic);
  });

  return Promise.all(process).then((res) => res.length);
}
