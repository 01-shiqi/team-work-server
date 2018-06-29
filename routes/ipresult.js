'use strict'

import express from 'express';
import IPResult from '../controller/ipresult'
const router = express.Router()

//获取一个用户一个试验的判读结果
router.get('/:id/', IPResult.callFunc('loadInstanceIPResult'));

//获取所有用户一个试验的判读结果
router.get('/:id/all', IPResult.callFunc('loadAllInstanceIPResult'));

//保存判读结果
router.post('/:id/', IPResult.callFunc('saveInstanceIPResult'));


export default router