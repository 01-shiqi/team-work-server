'use strict';

import express from 'express';
import User from '../controller/user'
import Check from '../middlewares/check'

const router = express.Router()




// 登录
router.post('/login', User.login)
router.post('/keylogin', User.keyLogin)


export default router