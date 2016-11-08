'use strict';

require('colors');
var conf = require('fs').readFileSync(__dirname + '/config.json');

console.log(conf.toString());
process.__config = JSON.parse(conf.toString());

var addCommentToStoriesInJira = require('./actions/addCommenttoStoriesInJira');

addCommentToStoriesInJira(['CCS-369'], 'test comment')
.then((e) => console.log('\n\nBe happy!'.green), (e) => console.log(e))
.catch((e) => { console.log(JSON.strigify(e)); })
