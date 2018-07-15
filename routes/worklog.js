'use strict';

import express from 'express';
import Home from '../controller/home';
import Worklog from '../controller/worklog';
import Task from '../controller/task';
import Leave from '../controller/leave';
import Trip from '../controller/trip';
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

router.get('/manage-leaves', Check.checkAdmin, Leave.manageLeaves)
router.get('/apply-for-leave', Check.checkLogin, Leave.applyForLeave)
router.post('/create-leave', Check.checkLogin, Leave.createLeave)
router.post('/update-leave', Check.checkLogin, Leave.updateLeave)
router.post('/verify-leave', Check.checkLogin, Leave.verifyLeave)
router.post('/approve-leave', Check.checkLogin, Leave.approveLeave)
router.delete('/delete-leaves', Check.checkLogin, Leave.deleteLeaves)
router.get('/my-leaves', Check.checkLogin, Leave.getMyLeaves)

router.get('/manage-trips', Check.checkAdmin, Trip.manageTrips)
router.get('/apply-for-trip', Check.checkLogin, Trip.applyForTrip)
router.post('/create-trip', Check.checkLogin, Trip.createTrip)
router.post('/update-trip', Check.checkLogin, Trip.updateTrip)
router.post('/verify-trip', Check.checkLogin, Trip.verifyTrip)
router.post('/approve-trip', Check.checkLogin, Trip.approveTrip)
router.delete('/delete-trips', Check.checkLogin, Trip.deleteTrips)
router.get('/my-trips', Check.checkLogin, Trip.getMyTrips)

router.post('/login', User.login)
router.get('/logout', User.logout)
router.get('/login', User.getLogin)

export default router