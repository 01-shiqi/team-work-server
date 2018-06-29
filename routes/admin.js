'use strict';

import express from 'express'
import Admin from '../controller/admin/admin'
const router = express.Router()
// router.post('/register', Admin.register);
//获取当前用户下的发次信息
router.get('/tasks/model/:id', Admin.getTasks);
//获取当前用户下的型号信息
router.get('/models', Admin.getAllModel);
//获取当前用户下的试验信息
router.get('/instances/task/:id', Admin.getInstance);
router.get('/info', Admin.getAdminInfo);
//获取系统信息，用于构建参数树
router.get('/params-tree/:id', Admin.getParamTree);
//获取参数信息
router.get('/params/:id', Admin.getParams);
//获取参数数据
router.get('/params-data/:instanceID/:systemID/:paramType/:paramID', Admin.getParamData);
// 发布试验
router.get('/publishInstance', Admin.publishInstance);
// 取消发布试验
router.get('/unpublishInstance', Admin.unpublishInstance);
// 重命名试验
router.get('/renameInstance', Admin.renameInstance);
// 测试客户端与服务端是否能够成功连接
router.get('/testConnection', Admin.testConnection);
// 删除试验
router.delete('/deleteInstance', Admin.deleteInstance);

router.post('/update/avatar/:admin_id', Admin.updateAvatar);


export default router