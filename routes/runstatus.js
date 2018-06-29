'use strict';
import runStatus from '../controller/runstatus'
import Check from '../middlewares/check'
import express from 'express';


const router = express.Router()


//在远程服务器上创建报告
router.get('', runStatus.callFunc('sendRunStatus'));

export default router