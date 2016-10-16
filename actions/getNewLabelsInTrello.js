'use strict';
const trello = require('./trello');
const jira = require('./jira');

const blackList = [ 'Bug' ];

module.exports = function (trelloBoardId, jiraProject) {
  return Promise.all([
    jira.getEpics(jiraProject),
    trello.getLabels(trelloBoardId)
  ])
  .then(function (result) {
    let epics = result[0];
    let labels = result[1];

    let newLabels = labels
            .filter((label) => epics.every((epic) => epic.name !== label.name))
            .map((label) => label.name);

    // black listing
    newLabels = newLabels.filter((label) => {
      return blackList.indexOf(label) == -1;
    })

    return {
      epicsInJira: epics.map((e) => e.name),
      labelsInTrello: labels.map((e) => e.name),
      newLabels: newLabels
    };
  });
}
