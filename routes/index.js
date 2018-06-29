'use strict';

// import v1 from './v1'
// import v2 from './v2'
// import v3 from './v3'
// import v4 from './v4'
// import ugc from './ugc'
// import bos from './bos'
// import eus from './eus'
// import admin from './admin'
// import statis from './statis'
// import member from './member'
// import shopping from './shopping'
// import promotion from './promotion'
// import crit from './crit'
// import user from './user'
// import report from './report'
// import template from './template'
// import outlier from './outlier'
// import ipresult from './ipresult'
// import file from './files'
// import instanceInfo from './instanceInfo'
import runstatus from './runstatus'
import match from './match'

import Const from './consts'

import worklog from './worklog'

const CRIT_PATH_V1 = Const.APIV1 + '/crits'
const USER_PATH_V1 = Const.APIV1 + '/users'
const TEMPLATE_PATH_V1 = Const.APIV1 + '/templates'
const REPORT_PATH_V1 = Const.APIV1 + '/reports'
const IPRESULT_PATH_V1 = Const.APIV1 + '/ipresults'
const EXPECTED_ENVELOPE_PATH_V1 = Const.APIV1 + '/files'
const OUTLIER_PATH_V1 = Const.APIV1 + '/outliers'
const INSTANCE_MANGER_V1 = Const.APIV1 + '/data'
const RUNSTATUS = '/dataip/runStatus';

export default app => {
	// app.get('/', (req, res, next) => {
	// 	res.redirect('/');
	// });
	// app.use('/v1', v1);
	// app.use('/v2', v2);
	// app.use('/v3', v3);
	// app.use('/v4', v4);
	// app.use('/ugc', ugc);
	// app.use('/bos', bos);
	// app.use('/eus', eus);
	// app.use('/member', member);
	// app.use('/statis', statis);
	// app.use('/shopping', shopping);
	// app.use('/promotion', promotion);

	// app.use(INSTANCE_MANGER_V1, instanceInfo);
	// app.use(CRIT_PATH_V1, crit);
	// app.use(USER_PATH_V1, user);
	// app.use(REPORT_PATH_V1, report);
	// app.use(TEMPLATE_PATH_V1, template);
	// app.use(OUTLIER_PATH_V1, outlier);
	// app.use(IPRESULT_PATH_V1, ipresult);
	// app.use(EXPECTED_ENVELOPE_PATH_V1, file);
	// app.use(RUNSTATUS, runstatus);

	app.get('/', (req, res, next) => {
		res.redirect('/index');
	});

	app.use('/', worklog);

}