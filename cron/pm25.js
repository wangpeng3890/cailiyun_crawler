"use strict";
var Crawler = require("crawler");
var dateFormat = require('dateformat');
var ALY = require('aliyun-sdk');

var memcached = ALY.MEMCACHED.createClient(11211, 'e20c6c4640ce11e4.m.cnbjalicm12pub001.ocs.aliyuncs.com', {
	username: 'e20c6c4640ce11e4', 
	password: '1234ABcd'
});

function task(){
	var pm25 = new Object();
	var now = new Date();
	var c = new Crawler({
		maxConnections : 10,
		// This will be called for each crawled page
		callback : function (error, result, $) {
			if(error == null){
				$('a[class="cbol_nongdu_name"]').each(function(i){
					pm25.title = $(this).text();
				});
				$('span[class="cbol_nongdu_num_1"]').each(function(i){
					pm25.num = $(this).text();
				});
				$('div[class="citydata_updatetime"]').each(function(i){
					pm25.updated = $(this).text();
				});
				$('span[class="city_name"]').each(function(i){
					pm25.city_name = $(this).text();
				});
				$('div[class="cbor_gauge"] span').each(function(i){
					pm25.level = $(this).text();
				});
				$('div[class="cbor_tips"]').each(function(i){
					pm25.tips = $(this).text();
					pm25.tips = pm25.tips.replace(/\s+/g, "");
				});
				
				var pm25_text = JSON.stringify(pm25);
				console.log(pm25_text);
				if(pm25_text.indexOf("北京") > -1){
					memcached.set('pm25_beijing', pm25_text, function(err, data) {
						// 如果写入数据错误
						if(err) {
							console.log('add error:', err);
							return;
						}
					});
				}else if(pm25_text.indexOf("天津") > -1){
					memcached.set('pm25_tianjin', pm25_text, function(err, data) {
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
	c.queue('http://www.pm25.com/city/beijing.html');
	c.queue('http://www.pm25.com/city/tianjin.html');
}

module.exports = function(cronJob) {
  var job = {};
  job.name= "PM2.5数据";
  job.run = new cronJob('* */10 * * * *', function(){
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