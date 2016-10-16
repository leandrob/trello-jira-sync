'use strict';
require('colors');
const getNewLabelsInTrello = require('./getNewLabelsInTrello');
const createEpicsInJira = require('./createEpicsInJira');

module.exports = function (trelloBoardId, jiraProject) {
  return getNewLabelsInTrello(trelloBoardId, jiraProject)
    .then((result) => {
      console.log('Epics in Jira: '.red + result.epicsInJira.sort().join(', '));
      console.log('Labels in Trello: '.blue + result.labelsInTrello.sort().join(', '));

      if (result.newLabels.length === 0) {
        console.log('No new labels in trello, so no epics to create!'.yellow);
        return;
      }

      console.log('Epics to Create in Jira: '.green + result.newLabels.sort().join(', '));

      return createEpicsInJira(jiraProject, result.newLabels).then((epicsCreated) => {
        console.log(epicsCreated + ' epics created!');
      });
    })
}
