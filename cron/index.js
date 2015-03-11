var CronJob = require('cron').CronJob;
var fs        = require("fs");
var path      = require("path");

var cron = {};
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
	var defineCall = require(path.join(__dirname, file));
	var job = defineCall(CronJob);
	cron[job.name] = job;
	console.log(job.name + "任务已经加入任务队列");
  });

module.exports = cron;