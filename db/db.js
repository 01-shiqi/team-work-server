'use strict';

// import mongoose from 'mongoose';
import config from 'config-lite';
import mysql from 'mysql';
import logger from '../logger/logger';

//  mongoose.connect(config.url, { server: { auto_reconnect: true } });
// mongoose.Promise = global.Promise;

// const db = mongoose.connection;

// db.once('open', () => {
//     console.log('连接数据库成功')
// })

// db.on('error', function (error) {
//     console.error('Error in MongoDb connection: ' + error);
//     mongoose.disconnect();
// });

// db.on('close', function () {
//     console.log('数据库断开，重新连接数据库');
//     mongoose.connect(config.url, { server: { auto_reconnect: true } });
// });

function handleError(err) {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            connect();
        } else {
            console.log('数据库连接失败。' + err);
            setTimeout(connect, 2000);
        }
    }
    else {
        console.log('数据库连接成功。');
        logger.info("测试信息：数据库连接成功");
        logger.error("测试信息：数据库连接失败");
    }
}

function connect() {
    _connection = mysql.createConnection({
        host: config.host, //主机
        user: 'root',           //mysql用户名
        password: 'Abcd12345678',           //MySQL用户密码
        port: '3306',           //端口号
        dateStrings: true,
        database: config.database,         //数据库名称
    });
    _connection.connect(handleError);
    _connection.on('error', handleError);
}

function reconnect(){
    connect();
}

var _connection;
var connection = function() {
    return _connection;
}
connect();

export default {
    connection,
    reconnect
}
