'use strict';

import express from 'express';
import Crit from '../controller/crit'
import Check from '../middlewares/check'

const router = express.Router()




//获取判据文件名称
router.get('/', Check.checkLogin, Crit.callFunc('getCritsFiles'))

// 获取判据文件内容
router.get('/:id', Check.checkLogin, Crit.callFunc('getCritContent'))

//添加一条判据，不包含内容
router.post('/', Check.checkLogin, Crit.callFunc('addCrit'))

//保存判据内容
router.post('/:id/content', Check.checkLogin, Crit.callFunc('saveCrit'))

//重命名判据名称
router.post('/:id', Check.checkLogin, Crit.callFunc('renameCrit'))

//删除判据
router.delete('/:id', Check.checkLogin, Crit.callFunc('deleteCrit'))

export default router