'use strict';

module.exports = {
	host: '127.0.0.1',
	database: 'teamwork',
	httpPort: 8080,
	httpsPort: 443,
	session: {
		name: 'SID',
		secret: 'SID',
		cookie: {
			httpOnly: true,
		    secure:   false,
		    maxAge:   365 * 24 * 60 * 60 * 1000,
		}
	}
}