'use strict';
require('colors');
const getCardsByListsFromTrello = require('./getCardsByListsFromTrello');
const transitionStoriesInJira = require('./transitionStoriesInJira');
const addCommentToStoriesInJira = require('./addCommentToStoriesInJira');
const jira = require('./jira');

// const transitionsMap = {
//   'start progress' : 'in progress',
//   'build needed': 'waiting on build',
//   'qa in progress': 'qa in progress',
//   'resolve': 'resolved',
//   'close': 'closed'
// }

const transitionsMap = {
  'Backlog': 'Backlog',
  'To Do': 'To Do',
  'In Progress' : 'In Progress',
  'Waiting On Build': 'Waiting On Build',
  'Deployed to Dev': 'Deployed to Dev',
  'Ready for QA': 'Ready for QA',
  'Deployed to QA': 'Deployed to QA',
  'Ready For Staging': 'Ready For Staging',
  'Deployed to Staging': 'Deployed to Staging',
  'Resolved': 'Resolved',
  'Closed': 'Closed'
}

module.exports = function (trelloBoard, jiraProject, lists, transition, comment) {
  return getCardsByListsFromTrello(trelloBoard, lists)
    .then((cards) => {
      if (cards.length === 0) {
        console.log(('No cards in this boards: ' + lists.join(',')).yellow);
        return;
      }

      console.log(cards.length.toString().green + ' cards found!');

      let keys = cards.map((c) => c.key);

      return jira.getStoriesByKeys(keys).then((stories) => {
        let newStatus = transitionsMap[transition];

        if (!newStatus) { throw new Error('Transition ' + transition + ' was not found')}

        let withNewStatus = stories.filter((s) => s.status.toLowerCase() !== newStatus.toLowerCase())

        if (withNewStatus.length === 0) {
          console.log(('All of them seems to be already "' + newStatus + '" in jira.').yellow);
          return;
        }

        console.log((withNewStatus.length.toString() + ' of them needs to be moved to "' + newStatus + '"').green);
        console.log('Trying to update all of them in jira...');

        return transitionStoriesInJira(jiraProject, withNewStatus.map((s) => s.key), transition).then((storiesUpdated) => {
            if (storiesUpdated === 0) {
              console.log('No cards updated!'.red);
              return;
            }

            return addCommentToStoriesInJira(withNewStatus.map((s) => s.key), comment).then(() => {
                console.log((storiesUpdated + ' cards updated!').green);
            })
        });
      })
    })
}
