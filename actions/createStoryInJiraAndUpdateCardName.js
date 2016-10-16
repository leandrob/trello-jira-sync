'use strict';
const trello = require('./trello');
const jira = require('./jira');

module.exports = function (trelloBoardId, jiraProject, cards) {
  let process = cards.map((card) => {

    let epic = card.labels ? card.labels[0] : null; //if more than one I just take the first one.
    // 1. Create the Story in Jira
    console.log('Creating Story in Jira: "' + card.name.substr(0, 10) + '..." (' + (epic || 'No Epic'.red) + ')');
    return jira.createStory(jiraProject, {
      name: card.name,
      epic: epic,
      cardId: card.id
    })
    .then((story) => {
      console.log('Updating trello card "' + card.name.substr(0, 10) + '..." with ' + story.key);
      return trello
      .updateCardName(card.id, story.key + ' - ' + card.name)
    });
  });

  return Promise.all(process).then ((c) => c.length);
}
