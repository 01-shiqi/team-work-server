'use strict';

import express from 'express';
import Template from '../controller/template';
import Check from '../middlewares/check';

const router = express.Router()

// 获取当前用户下所有模板的名称
router.get('/',Check.checkLogin, Template.callFunc('getTemplateNames'));

//获取当前模板
router.get('/default',Check.checkLogin, Template.callFunc('getCurTemplate'));

//保存当前模板信息
router.post('/default/:id',Check.checkLogin, Template.callFunc('saveCurTemplate'));

//保存模板内容
router.post('/:id/content',Check.checkLogin, Template.callFunc('saveTemplate'));

//创建新增模板
router.post('/', Check.checkLogin, Template.callFunc('createTemplate'));

//获取模版内容
router.get('/:id/content',Check.checkLogin, Template.callFunc('getTemplate'));

//重命名模板名称
router.post('/:id',Check.checkLogin, Template.callFunc('renameTemplate'));

// 删除模板
router.delete('/:id',Check.checkLogin, Template.callFunc('delTemplate'));

export default router