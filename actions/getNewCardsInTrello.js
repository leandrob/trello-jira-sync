'use strict';
const trello = require('./trello');

// trelloList is optional
module.exports = function (trelloBoardId, trelloList) {
  return trello.getCards(trelloBoardId, trelloList)
  .then((cards) => {
    return {
      cards: cards,
      newCards: selectCardsThatMakeSenseToCreateInJiraPlease(cards)
    }
  });

  function selectCardsThatMakeSenseToCreateInJiraPlease (cards) {
    return cards.filter((c) => {
      return !c.name.match(/(.+-.+ -)|^Task -/);
    })
  }
}
