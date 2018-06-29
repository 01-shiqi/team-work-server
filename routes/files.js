'use strict'

import express from 'express';
import Files from '../controller/files'
import Check from '../middlewares/check'


const router = express.Router()
//rais_restful/service/api/v1/files/???/
// 当前用户下创建一条系数文件
router.post('/:paramFileType/', Check.checkLogin, Files.callFunc('createParamSettingFile'));

//加载用户下所有系数文件名称
router.get('/:paramFileType/', Check.checkLogin, Files.callFunc('loadParamSettingFiles'));

//加载用户当前点击的系数文件内容  导出用户文件
router.get('/:paramFileType/:id/content', Check.checkLogin, Files.callFunc('loadParamSettingFile'));

//重命名系数文件名字
router.post('/:paramFileType/:id', Check.checkLogin, Files.callFunc('renameParamSettingFile'));

// 删除系数文件
router.delete('/:paramFileType/:id', Check.checkLogin, Files.callFunc('removeParamSettingFile'));

// 保存系数文件
router.post('/:paramFileType/:id/content', Check.checkLogin, Files.callFunc('saveParamSettingFile'));


//加载外部文件接口
router.get('/:paramFileType/fileName/:fileName/content', Check.checkLogin, Files.callFunc('load'));

export default router