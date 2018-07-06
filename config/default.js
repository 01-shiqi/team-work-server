'use strict';

module.exports = {
	host: '192.168.151.64',
	database: 'team_work',
	httpPort: 3002,
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