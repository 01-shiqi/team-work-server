'use strict';

import express from 'express';
import Match from '../controller/match';

const router = express.Router()

//获取当前用户下的型号信息
router.get('/list',  Match.callFunc('getList'));

export default router