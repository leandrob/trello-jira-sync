var Trello = require('trello');
var trello = new Trello(process.__config.credentials.trello.key, process.__config.credentials.trello.token);

var api = module.exports;

api.getLabels = function (board) {
  return new Promise((resolve, reject) => {
    trello.getLabelsForBoard(board, function (err, labels) {
      if (err) return reject(err);

      resolve(labels);
    });
  })
}

api.getCardsByList = function (board, listName) {
  return new Promise((resolve, reject) => {
      getListId(board, listName).then((listId) => {
          trello.getCardsOnList(listId, function (err, cards) {
            if (err) return reject(err);

            resolve(cards.map((c) => {
              return {
                name: c.name,
                labels: c.labels.map((l) => l.name),
                id: c.id
              }
            }));
          });
      });
  });
}

api.getCards = function (board) {
  return new Promise((resolve, reject) => {
    trello.getCardsOnBoard(board, function (err, cards) {
      if (err) return reject(err);

      resolve(cards.map((c) => {
        return {
          name: c.name,
          labels: c.labels.map((l) => l.name),
          id: c.id
        }
      }));
    });
  });
}

api.updateCardName = function (cardId, name) {
  return new Promise((resolve, reject) => {
    trello.updateCard(cardId, 'name', name, function (err,res) {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

api.createCard = function (board, list, details) {
  return new Promise((resolve, reject) => {
    return getListId(board, list).then((listId) => {
      trello.addCard(details.name, details.description, listId, function (err, res) {
        if (err) return reject(err);
        resolve(res);
      })
    });
  });
}

api.addAttachmentToCard = function (cardId, url) {
  return new Promise((resolve, reject) => {
    trello.addAttachmentToCard(cardId, url, function (err, res) {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

api.addLabelToCard = function (board, cardId, label, url) {
  return new Promise((resolve, reject) => {
    return getLabelId(board, label).then((labelId) => {

      trello.addLabelToCard(cardId, labelId, function (err, res) {
        if (err) return reject(err);
        resolve(res);
      });
    })
  });
}


var cache = {};
function getListId (board, name) {
  if (cache[board] && cache[board][name]) {
    return Promise.resolve(cache[board][name]);
  }

  return new Promise((resolve, reject) => {
    trello.getListsOnBoard(board, function (err, lists) {
      lists.map((l) => {
        cache[board] = cache[board] || {};
        cache[board][l.name] = l.id;
      });

      resolve(cache[board][name]);
    });
  })
}

var labelsCache = {};
function getLabelId (board, name) {
  if (labelsCache[board] && labelsCache[board][name]) {
    return Promise.resolve(labelsCache[board][name]);
  }

  return new Promise((resolve, reject) => {
    trello.getLabelsForBoard(board, function (err, lists) {
      lists.map((l) => {
        labelsCache[board] = labelsCache[board] || {};
        labelsCache[board][l.name] = l.id;
      });

      resolve(labelsCache[board][name]);
    });
  })
}
