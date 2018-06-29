'use strict';

import express from 'express';
import Home from '../controller/home';
import Worklog from '../controller/worklog';

const router = express.Router()

router.get('/index',  Home.getIndex)

router.get('/write-worklog', Worklog.writeWorklog)
router.post('/write-worklog', Worklog.commitWorklog)

router.get('/my-worklogs', Worklog.getMyWorklogs)

router.post('/update-worklog', Worklog.updateWorklog)

router.delete('/delete-worklogs', Worklog.deleteWorklogs)

export default router