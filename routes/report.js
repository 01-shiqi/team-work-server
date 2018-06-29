'use strict';

import express from 'express';
import Report from '../controller/report'
import Check from '../middlewares/check'

const router = express.Router()



//从服务器下载报告
router.get('/:id/content',Check.checkLogin, Report.callFunc('downloadReports'))

//加载报告
router.get('/',Check.checkLogin, Report.callFunc('loadReport'))

// 报告生成后自动上传到服务器
router.post('/:id/content',Check.checkLogin, Report.callFunc('uploadReport'));

// 手动修改报告后将内容上传到服务器
//reqrouter.post('/:id/content', Report.callFunc('postCritsSource'));

// 删除报告
router.delete('/:id',Check.checkLogin, Report.callFunc('deleteReport'));

//在远程服务器上创建报告
router.post('/',Check.checkLogin, Report.callFunc('createReport'));

export default router