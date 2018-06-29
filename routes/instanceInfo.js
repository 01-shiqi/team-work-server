'use strict';

import express from 'express';
import InstanceInfo from '../controller/instanceInfo';
import Check from '../middlewares/check';

const router = express.Router()

// 获取所有型号、发次、试验、时间、试验状态信息
router.get('/allInformation', Check.checkLogin, InstanceInfo.callFunc('allInformation'));

// 按照给定条件查询试验信息
router.post('/instance', Check.checkLogin, InstanceInfo.callFunc('queryInstance'));

//获取当前用户下的发次信息
router.get('/tasks/model/:id', Check.checkLogin,  InstanceInfo.callFunc('getTasks'));

//获取当前用户下的型号信息
router.get('/models', Check.checkLogin,  InstanceInfo.callFunc('getAllModel'));

//获取当前用户下的试验信息
router.get('/instances/task/:id', Check.checkLogin,  InstanceInfo.callFunc('getInstance'));

router.get('/info', Check.checkLogin,  InstanceInfo.callFunc('getAdminInfo'));

//获取系统信息，用于构建参数树
router.get('/params-tree/:id', Check.checkLogin,  InstanceInfo.callFunc('getParamTree'));

//获取参数信息
router.get('/params/:id', Check.checkLogin,  InstanceInfo.callFunc('getParams'));

//获取参数数据
router.get('/params-data/:instanceID/:systemID/:paramType/:paramID', Check.checkLogin,  InstanceInfo.callFunc('getParamData'));

// 发布试验
router.post('/published', Check.checkLogin,  InstanceInfo.callFunc('publishInstance'));

// 取消发布试验
router.post('/cancled', Check.checkLogin,  InstanceInfo.callFunc('unpublishInstance'));

// 重命名试验
router.post('/rename', Check.checkLogin,  InstanceInfo.callFunc('renameInstance'));

// 测试客户端与服务端是否能够成功连接
router.get('/testConnection', Check.checkLogin,  InstanceInfo.callFunc('testConnection'));

// 删除试验
router.delete('/:id', Check.checkLogin,  InstanceInfo.callFunc('deleteInstance'));

router.post('/instanceData',/* Check.checkLogin,*/ InstanceInfo.callFunc('upLoadInstance'));

router.get('/downloadinfo', InstanceInfo.callFunc('downloadInfo'));
export default router