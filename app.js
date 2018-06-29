import express from 'express';
import config from 'config-lite';
import router from './routes/index.js';
import cookieParser from 'cookie-parser'
import session from 'express-session';
// import connectMongo from 'connect-mongo';
import winston from 'winston';
import expressWinston from 'express-winston';
import path from 'path';
import history from 'connect-history-api-fallback';
// import Statistic from './middlewares/statistic'

var http = require('http');
var https = require('https');
var fs = require('fs');

var sessionSign = {};

const app = express();

app.all('*', (req, res, next) => {
	res.header("Access-Control-Allow-Origin", req.headers.origin || '*');
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
	res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  	res.header("Access-Control-Allow-Credentials", true); //可以带cookies
	res.header("X-Powered-By", '3.2.1')
	if (req.method == 'OPTIONS') {
	  	res.send(200);
	} else {
	    next();
	}
});

app.set('views', path.join(__dirname, 'views/pug'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

// app.use(Statistic.apiRecord)

app.use(cookieParser());

app.use(session({
	  	name: config.session.name,
		secret: config.session.secret,
		resave: true,
		saveUninitialized: false,
		cookie: config.session.cookie
}))

app.use(expressWinston.logger({
    transports: [
        new (winston.transports.Console)({
          json: true,
          colorize: true
        }),
        new winston.transports.File({
          filename: __dirname + '/logs/success.log'
        })
    ]
}));

router(app);

app.use(function(err, req, res, next){
    console.log('error: ' + err)
    res.end();
})

app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
          json: true,
          colorize: true
        }),
        new winston.transports.File({
          filename:  __dirname + '/logs/error.log'
        })
    ]
}));

// app.use(history());
// app.use(express.static(__dirname + '/public'));

var options = {
	key: fs.readFileSync(__dirname + '/caecc.com.private-key.pem'),
	cert: fs.readFileSync(__dirname +  '/caecc.com.self-cert.pem')
};

var server = https.createServer(options, app);

server.listen(config.httpsPort);

var httpServer = http.createServer(app);
httpServer.listen(config.httpPort)

console.log('https port: ' + config.httpsPort);
console.log('http port: ' + config.httpPort);
