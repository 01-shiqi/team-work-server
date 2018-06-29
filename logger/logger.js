'use strict';

import fs from 'fs';

var todayTime = new Date();
var year = todayTime.getFullYear();
var month = todayTime.getMonth() + 1;
var day = todayTime.getDate();
var hour = todayTime.getHours();
var minute = todayTime.getMinutes();
var second = todayTime.getSeconds();
var time = year + '-' + month + '-' + day  + ' ' + hour + '-' + minute + '-' + second;
var info = fs.createWriteStream(__dirname + '/' + time + ' success.log');
var error = fs.createWriteStream(__dirname + '/' + time + ' error.log');
var logger = new console.Console(info, error);

export default logger;

