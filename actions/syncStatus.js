'use strict';
require('colors');
const getCardsByListsFromTrello = require('./getCardsByListsFromTrello');
const transitionStoriesInJira = require('./transitionStoriesInJira');

module.exports = function (trelloBoard, jiraProject, lists, transition) {
  return getCardsByListsFromTrello(trelloBoard, lists)
    .then((cards) => {
      if (cards.length === 0) {
        console.log(('No cards in this boards: ' + lists.join(',')).yellow);
        return;
      }

      console.log(cards.length.toString().green + ' cards found!');
      console.log('Trying to update all of them in jira...');

      return transitionStoriesInJira(jiraProject, cards.map((c) => c.key), transition)
      .then((storiesUpdated) => {
        console.log((storiesUpdated + ' cards updated!').green);
      });
    });
}
