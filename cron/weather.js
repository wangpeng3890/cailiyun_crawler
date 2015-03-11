"use strict";
var Crawler = require("crawler");
var dateFormat = require('dateformat');
var ALY = require('aliyun-sdk');

var memcached = ALY.MEMCACHED.createClient(11211, 'e20c6c4640ce11e4.m.cnbjalicm12pub001.ocs.aliyuncs.com', {
	username: 'e20c6c4640ce11e4', 
	password: '1234ABcd'
});

function task(){
	var weather = new Object();
	var now = new Date();
	var c = new Crawler({
		maxConnections : 10,
		// This will be called for each crawled page
		callback : function (error, result) {
			if(error == null){
				console.log(result.body);
				if(result.body.indexOf("北京") > -1){
					memcached.set('weather_beijing', result.body, function(err, data) {
						// 如果写入数据错误
						if(err) {
							console.log('add error:', err);
							return;
						}
					});
				}else if(result.body.indexOf("天津") > -1){
					memcached.set('weather_tianjin', result.body, function(err, data) {
						// 如果写入数据错误
						if(err) {
							console.log('add error:', err);
							return;
						}
					});
				}
			}else{
				console.log(error);
			}
		}
	});
	c.queue([{
		uri: 'http://api.map.baidu.com/telematics/v3/weather?location=北京&output=json&ak=E023614bbfe03bcfec6ec028812c8a6d',
		jQuery: false
	}]);
	c.queue([{
		uri: 'http://api.map.baidu.com/telematics/v3/weather?location=天津&output=json&ak=E023614bbfe03bcfec6ec028812c8a6d',
		jQuery: false
	}]);
}

module.exports = function(cronJob) {
  var job = {};
  job.name= "天气预报";
  job.run = new cronJob('0 30 0 * * *', function(){
		console.log("start");
		task();
	  }, function () {
		// This function is executed when the job stops
		console.log("stop");
	  },
	  true
  );
  return job;
};

