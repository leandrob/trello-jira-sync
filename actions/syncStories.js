'use strict';
require('colors');
const getNewCardsInTrello = require('./getNewCardsInTrello');
const createStoryInJiraAndUpdateCardName = require('./createStoryInJiraAndUpdateCardName');

module.exports = function (trelloBoardId, jiraProject, trelloList) {
  return getNewCardsInTrello(trelloBoardId, trelloList).then((result) => {
    console.log(result.cards.length.toString().green + ' cards found in this Trello board.');

    if (result.newCards.length === 0) {
      console.log('None seems to be a new story.'.yellow);
      return;
    }

    console.log((result.newCards.length.toString() + ' of them seems to be new stories.').green);

    return createStoryInJiraAndUpdateCardName(trelloBoardId, jiraProject, result.newCards)
    .then((cardsUpdated) => {
      console.log((cardsUpdated + ' cards updated!').green);
    });
  });
}
