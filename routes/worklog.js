'use strict';

import express from 'express';
import Home from '../controller/home';
import Worklog from '../controller/worklog';
import Task from '../controller/task';
import User from '../controller/user';
import Check from '../middlewares/check'

const router = express.Router()

router.get('/index', Check.checkLogin, Home.getIndex)

router.get('/write-worklog', Check.checkLogin, Worklog.writeWorklog)
router.post('/write-worklog', Check.checkLogin, Worklog.commitWorklog)
router.get('/my-worklogs', Check.checkLogin, Worklog.getMyWorklogs)
router.post('/update-worklog', Check.checkLogin, Worklog.updateWorklog)
router.delete('/delete-worklogs', Check.checkLogin, Worklog.deleteWorklogs)

router.get('/manage-worklogs', Check.checkAdmin, Worklog.manageWorklogs)

router.get('/manage-tasks', Check.checkAdmin, Task.manageTasks)
router.get('/create-task', Check.checkAdmin, Task.getCreateTask)
router.post('/create-task', Check.checkAdmin, Task.createTask)
router.post('/update-task', Check.checkAdmin, Task.updateTask)
router.post('/verify-task', Check.checkAdmin, Task.verifyTask)
router.post('/close-task', Check.checkAdmin, Task.closeTask)
router.delete('/delete-tasks', Check.checkAdmin, Task.deleteTasks)
router.get('/my-tasks', Check.checkLogin, Task.getMyTasks)


router.post('/login', User.login)
router.get('/logout', User.logout)
router.get('/login', User.getLogin)

export default router