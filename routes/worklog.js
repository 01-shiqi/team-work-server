'use strict';

import express from 'express';
import Home from '../controller/home';
import Worklog from '../controller/worklog';
import User from '../controller/user';
import Check from '../middlewares/check'

const router = express.Router()

router.get('/index', Check.checkLogin, Home.getIndex)

router.get('/write-worklog', Check.checkLogin, Worklog.writeWorklog)
router.post('/write-worklog', Check.checkLogin, Worklog.commitWorklog)
router.get('/my-worklogs', Check.checkLogin, Worklog.getMyWorklogs)
router.post('/update-worklog', Check.checkLogin, Worklog.updateWorklog)
router.delete('/delete-worklogs', Check.checkLogin, Worklog.deleteWorklogs)

router.post('/login', User.login)
router.get('/logout', User.logout)
router.get('/login', User.getLogin)

export default router