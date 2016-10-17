'use strict';
var conf = require('fs').readFileSync(__dirname + '/config.json');
process.__config = JSON.parse(conf.toString());

require('colors');
const syncEpics = require('./actions/syncEpics');
const syncStories = require('./actions/syncStories');
const syncStatus = require('./actions/syncStatus');
const syncBugs = require('./actions/syncBugs');

let comp = process.argv[2];

if (!comp) {
  console.log('Choose component!'.red);
  process.exit();
}

console.log(('Working with ' + comp).green);

const current = process.__config.projects[comp];

sync(current.trello, current.jira)
  .then((e) => console.log('\n\nBe happy!'.green), (e) => console.log(e))
  .catch((e) => { console.log(JSON.strigify(e)); })

function sync(trelloBoard, jiraProject) {
  console.log('\n1. Syncing Labels to Epics.'.cyan);
  return syncEpics(trelloBoard, jiraProject)
    .then(() => {
      console.log('\n2. Syncing Cards to Stories.'.cyan);
      return syncStories(trelloBoard, jiraProject);
    })
    .then(() => {
      console.log('\n3. Syncing Bugs to Cards.'.cyan);
      return syncBugs(trelloBoard, jiraProject);
    })
    .then(() => {
      console.log('\n4. Syncing Stories in progress.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['In Progress', 'Blocked', 'Ready to Merge', 'Deployed to Dev'], 'Start Progress');
    })
    .then(() => {
      console.log('\n5. Syncing Stories Build Needed.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['Ready for QA'], 'Build Needed');
    })
    .then(() => {
      console.log('\n6. Syncing Stories QA in Progress.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['Deployed to QA'], 'QA in Progress');
    })
    .then(() => {
      console.log('\n7. Syncing Stories Resolve.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['Ready to Stage'], 'Resolve');
    })
    .then(() => {
      console.log('\n8. Syncing Stories Closed.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['Merged to Master'], 'Close');
    });
}
