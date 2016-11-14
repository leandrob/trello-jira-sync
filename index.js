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
      console.log('\n4. Syncing Stories in Backlog.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['Backlog'], 'Backlog', 'Story added to the backlog.');
    })
    .then(() => {
      console.log('\n5. Syncing Stories in Up Next.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['Up Next'], 'To Do', 'Story added to the sprint.');
    })
    .then(() => {
      console.log('\n6. Syncing Stories in In Progress.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['In Progress', 'Blocked'], 'In Progress', 'Progress started.');
    })
    .then(() => {
      console.log('\n6. Syncing Stories in Ready to Merge.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['Ready to Merge'], 'Waiting On Build', 'Dev done, pull requests created, waiting to be merged into develop branch.');
    })
    .then(() => {
      console.log('\n7. Syncing Stories in Deployed to dev.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['Deployed to Dev'], 'Deployed to Dev', 'Feature branch merged into dev. Deployed in dev environment.');
    })
    .then(() => {
      console.log('\n8. Syncing Stories in Ready for QA.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['Ready for QA'], 'Ready for QA', 'Dev approved, ready to be deployed in QA env.');
    })
    .then(() => {
      console.log('\n9. Syncing Stories in Deployed in QA.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['Deployed to QA'], 'Deployed to QA', 'Deployed in QA environment, ready for testing.');
    })
    .then(() => {
      console.log('\n10. Syncing Stories in Deployed to Stage.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['Deployed to Stage'], 'Deployed to Staging', 'Release deployed to staging.');
    })
    .then(() => {
      console.log('\n11. Syncing Stories in Ready for Production.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['Ready for Production'], 'Resolved', 'Release approved in Staging, ready to production deploy.');
    })
    .then(() => {
      console.log('\n12. Syncing Stories in Deployed to Production.'.cyan);
      return syncStatus(trelloBoard, jiraProject, ['Deployed to Production'], 'Closed', 'Release deployed in production!.');
    });
}
