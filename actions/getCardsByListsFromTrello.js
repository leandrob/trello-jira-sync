'use strict';
const trello = require('./trello');

// this is not by board, this is by list!
module.exports = function (trelloBoardId, lists) {
  var p = lists.map((listName) => trello.getCardsByList(trelloBoardId, listName));

  return Promise.all(p).then((cards) => {

    return cards.reduce((a, b) => a.concat(b), [])
            .filter((card) => {
              return card.name.match(/(.+-.+ -)/);
            })
            .map((card) => {
              card.key = card.name.split(/ /)[0]
              return card;
            });
  });
}
