'use strict';
const JiraApi = require('jira').JiraApi;

let jira = new JiraApi('https', process.__config.credentials.jira.domain, 443, process.__config.credentials.jira.user, process.__config.credentials.jira.pass, '2');

var api = module.exports;

api.getEpics = function (project) {
  return new Promise(function (resolve, reject) {
    jira.searchJira('project="' + project + '" AND issuetype = "Epic (Feature)"', { fields: ['summary']}, function (err, result) {
      if (err) {
        return reject(err);
      }

      if (!result || !result.issues || result.issues.lenght === 0) {
        return reject('No epics where found!');
      }

      return resolve(
        result.issues.map((i) => {
          return {
            id: i.id,
            key: i.key,
            name: i.fields.summary
          }
        })
      );
    });
  })
}

api.createEpic = function (project, name) {
  return new Promise((resolve, reject) => {
    var issue = {
      fields: {
        project: { key: project },
        summary: name,
        issuetype: { id: '10004' }, //Epic, https://mad-mobile.atlassian.net/rest/api/2/issuetype
        customfield_10018: name
      }
    }

    jira.addNewIssue(issue, function (err, res){
      if (err) reject(err);
      resolve(res);
    });
  });
}

api.createStory = function (project, details) {
  return new Promise((resolve, reject) => {
    // 1. Gets all the epics in project
    return api.getEpics(project).then((epics) => {
      let selectedEpic;

      if (details.epic) {
         selectedEpic = epics.filter((e) => e.name === details.epic)[0];

        if (!selectedEpic) {
          return reject('Epic ' + details.epic + ' was not found! (' + details.cardId + ' - ' + details.name +')');
        }
      }

      var issue = {
        fields: {
          project: { key: project },
          summary: details.name,
          issuetype: { id: '10000' }, //Epic,https://mad-mobile.atlassian.net/rest/api/2/issuetype
          customfield_10016: selectedEpic ? selectedEpic.key : null,
          description: 'tid:' + details.cardId.toString()
        }
      }

      jira.addNewIssue(issue, function (err, res){
        if (err) return reject(err);
        resolve(res);
      });
    });
  });
}

api.transitionStory = function (project, storyKey, transitionName) {
  return new Promise((resolve, reject) => {
    let update = getUpdateByTransition(transitionName);

    jira.transitionIssue(storyKey, update, function (err, res) {
      if (err) reject(err);
      resolve(res);
    });
  });
}

api.getBugs = function (project) {
  return new Promise(function (resolve, reject) {
    return api.getEpics(project).then((epics) => {
      let fields = [
        'summary',
        'description',
        'customfield_10025', //Steps to reproduce
        'customfield_10026', //Spected behaviour
        'customfield_10601', //Env
        'attachment',
        'customfield_10400', //Severity,
        'customfield_10016', //Epic
      ];

      jira.searchJira('project="' + project + '" AND issuetype = "Bug" AND status = "Open"', { fields: fields }, function (err, result) {
        if (err) {
          return reject(err);
        }

        if (!result || !result.issues || result.issues.lenght === 0) {
          return reject('No open Bugs where found!');
        }

        return resolve(
          result.issues.map((i) => {
            let bugEpic = epics.filter((e) => e.key === i.fields.customfield_10016)[0];

            return {
              id: i.id,
              key: i.key,
              name: i.fields.summary,
              description: i.fields.description,
              stepsToReproduce: i.fields.customfield_10025,
              expectedBehavior: i.fields.customfield_10026,
              env: i.fields.customfield_10601 ? i.fields.customfield_10601.value : null,
              severity: i.fields.customfield_10400 ? i.fields.customfield_10400.value : null,
              attachments: !(i.fields.attachment) ? null : i.fields.attachment.map((a) => a.content),
              epic: bugEpic ? bugEpic.name : null
            }
          })
        );
      });
    })
  })
}

function getUpdateByTransition (name) {
  switch (name.toLowerCase()) {
    case 'start progress': return { "transition": { "id": "4" } };

    case 'build needed': return { "transition": { "id": "711" }, "update": { "worklog": [{ "add": { "timeSpent": "1h" } } ] } };

    case 'qa in progress': return { "transition": { "id": "721" } };

    case 'resolve': return { "transition": { "id": "5" }, "update": { "worklog": [ { "add": { "timeSpent": "2m" } } ] } };

    case 'close': return { "transition": { "id": "701" } };

    default:
      throw new Error('Unknown status.');
  }
}
