"use strict";
var Crawler = require("crawler");
var dateFormat = require('dateformat');
var ALY = require('aliyun-sdk');

var memcached = ALY.MEMCACHED.createClient(11211, 'e20c6c4640ce11e4.m.cnbjalicm12pub001.ocs.aliyuncs.com', {
	username: '', 
	password: ''
});

function task(){
	var ret = [];
	var now = new Date();
	var c = new Crawler({
		maxConnections : 10,
		// This will be called for each crawled page
		callback : function (error, result, $) {
			if(error == null){
				$('div[class="op_traffic_title"]').each(function(i){
					var limit = new Object();
					var title = $(this).text();
					limit.title = title.substring(0,title.length-2);
					ret[i] = limit;
				});
				$('.op_traffic_time div[class!="op_traffic_left"][class!="op_traffic_right"][class!="op_traffic_title"][class!="op_traffic_right op_traffic_right_last"][class!="op_traffic_clear"]').each(function(i){
					var num = $(this).text();
					//console.log("num:"+num);
					if(num.indexOf("和")>0){
						var numArray = num.split("和");
						ret[i].num = new Array();
						ret[i].num = numArray;
					}else{
						ret[i].num = new Array();
						ret[i].num[0] = num;
					}
				});
				//console.log("ret:"+JSON.stringify(ret));
				var traffic_limit = {};
				traffic_limit.updated = dateFormat(now, "yyyy-mm-dd HH:MM:ss");
				traffic_limit.data = ret;
				traffic_limit.url = $("#1").find("h3").find("a").attr("href");
				traffic_limit.title = $("#1").find("h3").find("a").find("em").text();
				
				var traffic_limit_text = JSON.stringify(traffic_limit);
				console.log(traffic_limit_text);
				if(traffic_limit_text.indexOf("北京") > -1){
					memcached.set('traffic_limit_beijing', traffic_limit_text, function(err, data) {
						// 如果写入数据错误
						if(err) {
							console.log('add error:', err);
							return;
						}
					});
				}else if(traffic_limit_text.indexOf("天津") > -1){
					memcached.set('traffic_limit_tianjin', traffic_limit_text, function(err, data) {
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
	c.queue('http://www.baidu.com/s?wd=%E5%8C%97%E4%BA%AC%E9%99%90%E8%A1%8C&rsv_spt=1&issp=1&f=8&rsv_bp=0&rsv_idx=2&ie=utf-8&tn=baiduhome_pg');
	c.queue('http://www.baidu.com/s?wd=%E5%A4%A9%E6%B4%A5%E9%99%90%E8%A1%8C&rsv_spt=1&issp=1&f=8&rsv_bp=0&rsv_idx=2&ie=utf-8&tn=baiduhome_pg');
}

module.exports = function(cronJob) {
  var job = {};
  job.name= "车辆限行";
  job.run = new cronJob('0 30 2 * * *', function(){
  //job.run = new cronJob('*/10 * * * * *', function(){
		console.log("start");
		task();
	  }, function () {
		console.log("stop");
	  },
	  true
  );
  return job;
};