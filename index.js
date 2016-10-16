'use strict';
var conf = require('fs').readFileSync('./config.json');
process.__config = JSON.parse(conf.toString());

// const jira = require('./actions/jira');
//
// jira.getBugs(process.__config.projects.Core.jira)
// .then((c) => console.log(c))
// .catch((c) => console.log(c))


require('colors');
const syncEpics = require('./actions/syncEpics');
const syncStories = require('./actions/syncStories');
const syncStatus = require('./actions/syncStatus');
const syncBugs = require('./actions/syncBugs');


const current = process.__config.projects.UI;

sync(current.trello, current.jira)
.then((e) => console.log('\n\nBe happy!'.green))
.catch((e) => { console.log(JSON.strigify(e)); })

function sync(trelloBoard, jiraProject) {
  console.log('1. Syncing Labels to Epics.'.cyan);
  return syncEpics(trelloBoard, jiraProject).then(() => {

  console.log('\n2. Syncing Cards to Stories.'.cyan);
  return syncStories(trelloBoard, jiraProject).then(() => {

  console.log('\n3. Syncing Bugs to Cards.'.cyan);
  return syncBugs(trelloBoard, jiraProject).then(() => {

  console.log('\n4. Syncing Stories in progress.'.cyan);
  return syncStatus(trelloBoard, jiraProject, ['In Progress', 'Blocked', 'Ready to Merge', 'Deployed to Dev'], 'Start Progress').then(() => {

  console.log('\n5. Syncing Stories Build Needed.'.cyan);
  return syncStatus(trelloBoard, jiraProject, ['Ready for QA'], 'Build Needed').then(() => {

  console.log('\n6. Syncing Stories QA in Progress.'.cyan);
  return syncStatus(trelloBoard, jiraProject, ['Deployed to QA'], 'QA in Progress').then(() => {

  console.log('\n7. Syncing Stories Resolve.'.cyan);
  return syncStatus(trelloBoard, jiraProject, ['Ready to Stage'], 'Resolve').then(() => {

  console.log('\n8. Syncing Stories Closed.'.cyan);
  return syncStatus(trelloBoard, jiraProject, ['Merged to Master'], 'Close');

  })})})})})})});
}
