'use strict';
require('colors');
const jira = require('./jira');
const trello = require('./trello');

module.exports = function (trelloBoard, jiraProject) {
  return Promise.all([
    jira.getBugs(jiraProject),
    trello.getCards(trelloBoard)
  ]).then((result) => {
    let bugsInJira = result[0];
    let cardsInTrello = result[1];

    console.log(bugsInJira.length.toString().green + ' open bugs found in Jira.');

    let keysInTrello = cardsInTrello.map((card) => card.name.split(/ /)[0]);

    let newBugs = bugsInJira.filter((bug) => {
      return keysInTrello.indexOf(bug.key) == -1;
    });

    if (newBugs.length === 0) {
      console.log('None seems to be a new bug!'.yellow);
      return;
    }

    console.log((newBugs.length.toString() + ' of them seems to be new bugs.').green);

    let process = newBugs.map((bug) => {
      console.log('Creating a card for bug ' + ('"' + bug.key + ' - ' + bug.name.substr(0,10) + '..."').green);

      let details = {
        name: bug.key + ' - ' + bug.name,
        description: bug.description || ''
      }

      if (bug.severity) {
        details.name += ' (' + bug.severity + ')';
      }

      if (bug.env) {
        details.description += '\n\n**Bug Found In:** ' + bug.env;
      }

      if (bug.stepsToReproduce) {
        details.description += '\n\n\nSteps To Reproduce\n---' + bug.stepsToReproduce;
      }

      if (bug.expectedBehavior) {
        details.description += '\n\n\nExpected Behavior\n---' + bug.expectedBehavior;
      }

      if (bug.attachments) {
        details.description += '\n\n\n\n' + bug.attachments.map((a) => '![image]('+ a + ')').join('\n');
      }

      return trello.createCard(trelloBoard, 'Bugs', details).then((card) => {
        return trello.addLabelToCard(trelloBoard, card.id, 'Bug').then((c) => {
          if (!bug.epic) {
            return c;
          }

          return trello.addLabelToCard(trelloBoard, card.id, bug.epic);
        })
      })
    });

    return Promise.all(process);
  });
}
