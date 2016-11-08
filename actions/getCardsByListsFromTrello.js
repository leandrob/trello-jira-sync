'use strict';
const trello = require('./trello');

module.exports = function (trelloBoardId, lists) {
  var p = lists.map((listName) => trello.getCardsByList(trelloBoardId, listName));

  return Promise.all(p).then((cards) => {

    return cards.reduce((a, b) => a.concat(b), [])
            .filter((card) => {
              return card.name.match(/^(CP-|CCS-|RM-).*/);
            })
            .map((card) => {
              card.key = card.name.split(/ /)[0]
              return card;
            });
  });
}
