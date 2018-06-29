'use strict';

import express from 'express';
import Outlier from '../controller/outlier'
import Check from '../middlewares/check'

const router = express.Router()

// 获取野点信息
router.get('/:id', Check.checkLogin, Outlier.callFunc('getOutlier'));
// 移除所有野点
router.delete('/:instanceID/paramId/:paramID', Check.checkLogin, Outlier.callFunc('removeAllOutlier'));
// 移除野点
router.post('/delete/:id', Check.checkLogin, Outlier.callFunc('removeOutlier'));
// 设置野点
router.post('/:id', Check.checkLogin, Outlier.callFunc('setOutlier'));

export default router