'use strict'

import Base from './base';
import db from '../db/db'
import config from 'config-lite';
import logger from '../logger/logger'
var fs = require('fs');

// 试验信息， 试验ID为键值，存储intance的systemTableName与paramTableName
var instanceInfoCache = {};
var DATABASE = config.database;
const EXT_EXPECTED_CURVE = "expectedCurves";
const EXT_ENVELOPE_CURVE = "envelopeCurves";
const SLOW_TYPE = 0;
const CMD_TYPE = 1;
const SV_TYPE = 2;
const MV_TYPE = 3;
const SVMV_TYPE = 4;
const FLOW_TYPE = 5;
const TS_TYPE = 6;
const TSCODE_TYPE = 7;
const CMDCODE_TYPE = 8;
const NODEF_TYPE = 9;

class InstanceInfo extends Base {

    constructor() {
        super()

        this.allInformation = this.allInformation.bind(this);
        this.queryInstance = this.queryInstance.bind(this);
        this.getTasks = this.getTasks.bind(this);
        this.getAllModel = this.getAllModel.bind(this);
        this.getInstance = this.getInstance.bind(this);
        this.getParamTree = this.getParamTree.bind(this);
        this.getParams = this.getParams.bind(this);
        this.getParamData = this.getParamData.bind(this);
        this.publishInstance = this.publishInstance.bind(this);
        this.unpublishInstance = this.unpublishInstance.bind(this);
        this.renameInstance = this.renameInstance.bind(this);
        this.testConnection = this.testConnection.bind(this);
        this.deleteInstance = this.deleteInstance.bind(this);
        this.getDataTableNameFromCache = this.getDataTableNameFromCache.bind(this);
        this.loadDataTableNamesFromDB = this.loadDataTableNamesFromDB.bind(this);
        this.upLoadInstance = this.upLoadInstance.bind(this);
        this.downloadInfo = this.downloadInfo.bind(this);
    }

    async allInformation(req, res, next) {
        let result = {}, times = {};
        let types = [], phases = [];
        let modelSql = 'select id, name from a_model';
        let taskSql = 'select id, name from a_task';
        let typePhaseSql = 'select Type, Phase from a_instance';
        let timesSql = 'select Time from a_instance order by Time';
        try {
            let modelResult = await this.queryArray(modelSql);
            let taskResult = await this.queryArray(taskSql);
            let typePhaseResult = await this.queryArray(typePhaseSql);
            let timeResult = await this.queryArray(timesSql);

            result['models'] = modelResult;
            result['tasks'] = taskResult;
            for (let i = 0; i < typePhaseResult.length; i++) {
                types.push({ id: 0, name: typePhaseResult[i].Type });
                phases.push({ id: 0, name: typePhaseResult[i].Phase });
            }
            let timeCount = timeResult.length;
            if (timeCount > 0) {
                times['beginTime'] = timeResult[0].Time;
                times['endTime'] = timeResult[timeCount - 1].Time;
            }
            result['types'] = types;
            result['phase'] = phases;
            result['times'] = times;
            this.sendData(res, result);
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null);
        }
    }

    async queryInstance(req, res, next) {
        let content = await this.extractStringData(req);
        if (content == null) {
            this.sendFailed(res);
            return;
        }
        let queryInformation = JSON.parse(content);
        instanceInfoCache = {};
        let models = queryInformation["models"];
        let tasks = queryInformation["tasks"];
        let types = queryInformation["types"];
        let phases = queryInformation["phases"];
        let times = queryInformation["times"];
        let name = queryInformation["name"]
        let count = queryInformation["count"];
        let modelIDList = [], taskIDList = [];
        let typesList = '', phasesDList = '';
        let sql = '';
        sql = 'select a_instance.*, a_model.`Name` as ModelName, a_task.`Name` as TaskName from a_instance, a_model, a_task where a_instance.ModelID = a_model.ID and a_instance.Task_ID = a_task.ID ';
        for (let i = 0; i < models.length; i++) {
            modelIDList.push(models[i].id);
        }
        for (let i = 0; i < tasks.length; i++) {
            taskIDList.push(tasks[i].id);
        }

        for (let i = 0; i < types.length; i++) {
            if(i == types.length - 1)
                typesList = typesList + '\'' + types[i].name + '\'';
            else
                typesList = typesList + '\'' + types[i].name + '\',';
        }

        for (let i = 0; i < phases.length; i++) {
            if(i == phases.length - 1)
                phasesDList = phasesDList + '\'' + phases[i].name + '\'';
            else
                phasesDList = phasesDList + '\'' + phases[i].name + '\',';
        }
        let beginTime = times["beginTime"];
        let endTime = times["endTime"];
        if (models.length > 0)
            sql = sql + 'and ModelID in (' + modelIDList + ')';
        if (tasks.length > 0)
            sql = sql + ' and Task_ID in (' + taskIDList + ')';
        if (types.length > 0)
            sql = sql + ' and type in (' + typesList + ')';
        if (phases.length > 0)
            sql = sql + ' and phase in (' + phasesDList + ')';
        if (beginTime != '')
            sql = sql + 'and Time > \'' + beginTime + '\'';
        if (endTime != '')
            sql = sql + ' and Time < \'' + endTime + '\'';
        if (name != '')
            sql = sql + ' and a_instance.name like \'%' + name + '%\'';
        if (count > 0)
            sql = sql + ' limit ' + count;
        console.log(sql)
        try {
            let results = await this.queryArray(sql);

            let sendResult = { 'result': results };
            buildDataCache(instanceInfoCache, results, 1);
            this.sendData(res, sendResult);
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null);
        }
    }

    async getTasks(req, res, next) {
        try {
            let id = this.getID(req);
            let sql = 'select Name as name, ID as id from A_Task where Model_ID=' + id;
            let result = await this.queryArray(sql);
            this.sendData(res, result);
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null)
        }
    }
    async getAllModel(req, res, next) {
        try {
            let sql = 'select Name as name, ID as id, integrated from A_Model';
            let result = await this.queryArray(sql);
            console.log(result);
            this.sendData(res, result);
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null)
        }
    }
    async getInstance(req, res, next) {
        try {
            let id = this.getID(req);
            instanceInfoCache = {};
            let sql = 'select Name as name, Time as time,' +
                ' IsPublish as publishStatus, ID as id, SystemTableName, ParamTableName' +
                ' from A_Instance where Task_ID = ' + id;
            let results = await this.queryArray(sql);
            //添加进参数、系统表缓存
            buildDataCache(instanceInfoCache, results, 0);
            this.sendData(res, results);
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null)
        }
    }

    async getTableName(instanceID, columnNameOfTableName) {

        if (instanceInfoCache.hasOwnProperty(instanceID)) {
            return instanceInfoCache[instanceID][columnNameOfTableName];
        } else {
            var sql = 'select * from A_Instance where ID=' + instanceID;
            try {
                let result = await this.queryValue(sql);
                if (result != null)
                    return result[columnNameOfTableName];
                else
                    return '';
            }
            catch (error) {
                logger.error(error);
                return '';
            }
        }
    }


    /**
 * 读取系统对应的数据表名称
 * @param {*} instanceID 
 * @param {*} systemID 
 */
    async getDataTableName(instanceID, systemID) {

        try {
            var systemTableName = await this.getTableName(instanceID, 'SystemTableName');

            var dataTableName = this.getDataTableNameFromCache(instanceID, systemID)
            if (dataTableName != null)
                return dataTableName

            await this.loadDataTableNamesFromDB(instanceID, systemTableName);
            return this.getDataTableNameFromCache(instanceID, systemID)
        }
        catch (error) {
            logger.error(error);
            return '';
        }
    }
	/**
	 * 从缓存中读取系统对应的数据表名称
	 * @param {*} instanceID 
	 * @param {*} systemID 
	 */
    getDataTableNameFromCache(instanceID, systemID) {
        if (instanceInfoCache.hasOwnProperty(instanceID) && instanceInfoCache[instanceID].hasOwnProperty(systemID)) {
            return instanceInfoCache[instanceID][systemID]
        } else {
            return null;
        }
    }

	/**
	 * 从数据库中读取指定试验的系统信息，包括系统的ID及其对应的数据表的表名称
	 * @param {*} instanceID 
	 */
    async loadDataTableNamesFromDB(instanceID, systemTableName) {

        let sql = 'select * from ' + systemTableName + ' where InstanceID= ' + instanceID

        try {
            let results = await this.queryArray(sql);


            if (results == null || results.length <= 0)
                return

            var instanceInfo = instanceInfoCache[instanceID] || {};

            for (var i = 0; i < results.length; ++i) {
                instanceInfo[results[i].ID] = results[i].DataTableName
            }

            instanceInfoCache[instanceID] = instanceInfo;
        }
        catch (error) {
            logger.error(error);
            return;
        }
    }

    async getParamTree(req, res, next) {
        try {
            let instanceID = this.getID(req);
            console.log(instanceInfoCache);
            let systemTableName = await this.getTableName(instanceID, 'SystemTableName');

            let paramTreeList = [];
            let sql = 'select * from ' + systemTableName;
            let results = await this.queryArray(sql);
            let instanceInfo = instanceInfoCache[instanceID] || {};
            buildParamTree(results, paramTreeList, 0);
            this.sendData(res, paramTreeList);
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, []);
        }
    }

    async getParams(req, res, next) {
        try {
            let instanceID = this.getID(req);
            let systemTableName = await this.getTableName(instanceID, 'SystemTableName');
            let paramTableName = await this.getTableName(instanceID, 'ParamTableName');
            let strSQL = 'select p.ID as id, p.Name as name, p.Code as code, '
                + 'p.DataType as dataType, p.Unit as unit, s.ID as systemId, '
                + 's.Name as systemName, s.ParamType as paramType from ' + paramTableName + ' p, '
                + systemTableName + ' s  where p.SystemID  = s.ID';
            let result = await this.queryArray(strSQL);
            this.sendData(res, result);
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null);
        }
    }

    async getParamData(req, res, next) {
        try {
            let params = await this.extractParams(req);
            let instacneID = params.instanceID;
            let systemID = params.systemID;
            let dataTableName = await this.getDataTableName(instacneID, systemID);
            let paramType = params.paramType;
            //缓变
            if (paramType == SLOW_TYPE) {
                //4+0
                //参数个数 参数1ID 参数1数据长度 参数1数据 参数2ID 参数2数据长度 参数2数据...
                let sql = 'select * from ' + dataTableName;
                let result = await this.queryFields(sql);
                let results = result.results;
                let fields = result.fields;

                let dataCount = fields.length - 4;
                let size = results.length;
                let buffer = new Buffer(size * 28 * dataCount + 4);
                let dataLength = size * 21;
                buffer.writeUInt32LE(dataCount, 0);
                let offset = 4;
                for (let j = 4; j < fields.length; j++) {
                    let tempParamID = fields[j].name;
                    let paramID = tempParamID.substr(1, tempParamID.length);
                    buffer.writeUInt32LE(paramID, offset);
                    offset = offset + 4;
                    buffer.writeUInt32LE(dataLength, offset);
                    offset = offset + 4;
                    for (let i = 0; i < results.length; i++) {
                        buffer.writeUInt32LE(results[i].YCDate, offset);
                        offset = offset + 4;
                        buffer.writeDoubleLE(results[i].YCTime, offset);
                        offset = offset + 8;
                        buffer.writeDoubleLE(results[i][tempParamID], offset);
                        offset = offset + 8;
                        buffer.writeUInt8(0, offset);
                        offset = offset + 1;
                    }
                }
                console.log(buffer);
                this.sendData(res, buffer);
            }
            //指令
            else if (paramType == CMD_TYPE) {

            }
            //单值
            else if (paramType == SV_TYPE) {
                let sql = 'select * from ' + dataTableName;
                let results = await this.queryArray(sql);
                let buffer;
                var size = results.length;
                var offset = 0;
                if (size == 0) {
                    res.send(new Buffer(0));
                    return;
                }
                buffer = new Buffer(size * 16 + 4);
                buffer.writeUInt32LE(size, offset);
                offset += 4;
                for (var i = 0; i < size; i++) {
                    buffer.writeUInt32LE(results[i].ParamID, offset)
                    offset += 4;
                    buffer.writeUInt32LE(8, offset)
                    offset += 4;
                    buffer.writeDoubleLE(results[i].ParamValue, offset)
                    offset += 8;
                }
                this.sendData(res, buffer);
            }
            //多值
            else if (paramType == MV_TYPE) {
                let sql = 'select * from ' + dataTableName + ' where SystemID=' + systemID;
                let results = await this.queryArray(sql);

                let size = results.length;
                let offset = 0;
                let paramNumber = 1;
                if (size == 0) {
                    res.send(new Buffer(0));
                    return;
                }
                let tempParamID = results[0].ParamID;
                for (let n = 1; n < size; n++) {
                    if (tempParamID != results[n].ParamID) {
                        paramNumber++;
                        tempParamID = results[n].ParamID;
                    }
                }
                let buffer = new Buffer(4 + size * 48);
                buffer.writeUInt32LE(paramNumber, 0);
                let tempCount = 0;
                offset += 4;
                let paramIDoffset = offset;
                offset += 8;
                tempParamID = results[0].ParamID;
                for (let i = 0; i < size; i++) {
                    if (tempParamID == results[i].ParamID) {
                        if (results[i].ParamValue == null)
                            buffer.writeDoubleLE(0.0, offset)
                        else
                            buffer.writeDoubleLE(results[i].ParamValue, offset)
                        offset += 8;
                        if (results[i].ParamStringValue == null)
                            buffer.write("空", offset, 32, 'UTF-8')
                        else
                            buffer.write(results[i].ParamStringValue, offset, 32, 'UTF-8')
                        offset += 32;
                        tempCount++;
                    } else {
                        buffer.writeUInt32LE(tempParamID, paramIDoffset);
                        buffer.writeUInt32LE(tempCount * 40, paramIDoffset + 4);
                        tempCount = 0;
                        paramIDoffset = offset;
                        tempParamID = results[i].ParamID;
                        offset += 8;
                        if (results[i].ParamValue == null)
                            buffer.writeDoubleLE(0.0, offset)
                        else
                            buffer.writeDoubleLE(results[i].ParamValue, offset)
                        offset += 8;
                        if (results[i].ParamStringValue == null)
                            buffer.write("空", offset, 32, 'UTF-8')
                        else
                            buffer.write(results[i].ParamStringValue, offset, 32, 'UTF-8')
                        offset += 32;
                        tempCount++;
                    }
                }
                buffer.writeUInt32LE(tempParamID, paramIDoffset);
                buffer.writeUInt32LE(tempCount * 40, paramIDoffset + 4);
                this.sendData(res, buffer);

            }
            else if (paramType == SVMV_TYPE) {

            }
            //流程
            else if (paramType == FLOW_TYPE) {
                let sql = 'select * from ' + dataTableName + ' where  SystemID=' + systemID;
                let results = await this.queryArray(sql);
                let size = results.length;
                let offset = 0;
                if (size == 0) {
                    res.send(new Buffer(0));
                    return;
                }
                let buffer = new Buffer(4 + size * 48);
                buffer.writeUInt32LE(results.length, 0);
                offset += 4;
                for (let i = 0; i < results.length; i++) {
                    buffer.writeUInt32LE(results[i].ParamID, offset);
                    offset += 4;
                    //数据长度
                    buffer.writeUInt32LE(40, offset);
                    offset += 4;
                    buffer.writeUInt32LE(results[i].Number, offset);
                    offset += 4;
                    if (results[i].TestData == null) {
                        buffer.writeUInt32LE(0, offset);
                    } else {
                        buffer.writeUInt32LE(1, offset);
                    }
                    offset += 4;
                    buffer.writeDoubleLE(results[i].TestData, offset);
                    offset += 8;
                    if(results[i].UpperLimit == null) {
                        buffer.writeUInt32LE(0, offset);
                    } else {
                        buffer.writeUInt32LE(1, offset);
                    }
                    offset += 4;
                    buffer.writeDoubleLE(results[i].UpperLimit, offset);
                    offset += 8;
                    buffer.writeDoubleLE(results[i].LowerLimit, offset);
                    offset += 8;
                    buffer.writeUInt32LE(results[i].Result, offset);
                    offset += 4;
                }
                this.sendData(res, buffer);
                console.log(buffer);
            }
            //时序
            else if (paramType == TS_TYPE) {
                var sql = 'select * from ' + dataTableName + ' where  SystemID=' + systemID;
                db.connection().query('use ' + DATABASE);
                db.connection().query(sql, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }
                    if (results) {
                        var size = results.length;
                        var offset = 0;
                        if (size == 0) {
                            res.send(new Buffer(0));
                            return;
                        }
                        var buffer = new Buffer(size * 60 + 4);
                        buffer.writeUInt32LE(size, 0);
                        offset += 4;
                        for (var i = 0; i < size; i++) {
                            buffer.writeUInt32LE(results[i].ParamID, offset);
                            offset += 4;
                            buffer.writeUInt32LE(52, offset);
                            offset += 4;
                            buffer.writeUInt32LE(results[i].ParamID, offset);
                            offset += 4;
                            buffer.writeUInt32LE(results[i].TSNumber, offset);
                            offset += 4;
                            buffer.writeUInt32LE(results[i].TSCode, offset);
                            offset += 4;
                            buffer.writeUInt32LE(results[i].RelativeTSNumber, offset);
                            offset += 4;
                            buffer.writeDoubleLE(results[i].OffsetTime, offset);
                            offset += 8;
                            buffer.writeDoubleLE(results[i].StandardTime, offset);
                            offset += 8;
                            buffer.writeDoubleLE(results[i].Error, offset);
                            offset += 8;
                            buffer.writeDoubleLE(results[i].TestTime, offset);
                            offset += 8;
                            buffer.writeUInt32LE(results[i].Result, offset);
                            offset += 4;
                        }
                        res.send(buffer);
                    } else {
                        res.send(new Buffer(0));
                    }
                });
            }
            //时序码
            else if (paramType == TSCODE_TYPE) {
                var sql = 'select * from ' + dataTableName + ' where SystemID=' + systemID + ' order by ParamID,ID';
                db.connection().query('use ' + DATABASE);
                db.connection().query(sql, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                        res.send(new Buffer(0));
                    }
                    if (results) {
                        let size = results.length;
                        let offset = 0;
                        let paramNumber = 1;
                        if (size == 0) {
                            res.send(new Buffer(0));
                            return;
                        }
                        let tempParamID = results[0].ParamID;
                        for (let n = 1; n < size; n++) {
                            if (tempParamID != results[n].ParamID) {
                                paramNumber++;
                                tempParamID = results[n].ParamID;
                            }
                        }
                        let buffer = new Buffer(4 + size * 32);
                        buffer.writeUInt32LE(paramNumber, 0);
                        let tempCount = 0;
                        offset += 4;
                        let paramIDoffset = offset;
                        offset += 8;
                        tempParamID = results[0].ParamID;
                        for (var i = 0; i < size; i++) {
                            if (tempParamID == results[i].ParamID) {
                                buffer.writeUInt32LE(results[i].tsCode, offset);
                                offset += 4;
                                buffer.writeDoubleLE(results[i].testTime, offset);
                                offset += 8;
                                if (results[i].relativeTime == null)
                                    buffer.writeUInt32LE(0, offset);
                                else
                                    buffer.writeUInt32LE(1, offset);
                                offset += 4;
                                buffer.writeDoubleLE(results[i].relativeTime, offset);
                                offset += 8;
                                tempCount++;
                            } else {
                                buffer.writeUInt32LE(tempParamID, paramIDoffset);
                                buffer.writeUInt32LE(tempCount * 24, paramIDoffset + 4);
                                tempCount = 0;
                                paramIDoffset = offset;
                                tempParamID = results[i].ParamID;
                                offset += 8;
                                buffer.writeUInt32LE(results[i].tsCode, offset);
                                offset += 4;
                                buffer.writeDoubleLE(results[i].testTime, offset);
                                offset += 8;
                                if (results[i].relativeTime == null)
                                    buffer.writeUInt32LE(0, offset);
                                else
                                    buffer.writeUInt32LE(1, offset);
                                offset += 4;
                                buffer.writeDoubleLE(results[i].relativeTime, offset);
                                offset += 8;
                                tempCount++;
                            }
                        }
                        buffer.writeUInt32LE(tempParamID, paramIDoffset);
                        buffer.writeUInt32LE(tempCount * 24, paramIDoffset + 4);
                        res.send(buffer);
                    }
                });
            }
            //指令码
            // n:参数个数   m:从数据库中请求结果个数
            // buffer大小：4 + n * 8 + m * 20
            else if (paramType == CMDCODE_TYPE) {
                var sql = 'select * from ' + dataTableName + ' where SystemID=' + systemID + ' ORDER BY ParamID, ID';
                db.connection().query('use ' + DATABASE);
                db.connection().query(sql, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }
                    if (results) {
                        var offset = 0;
                        var paramNumber = 1;
                        var size = results.length;
                        if (size == 0) {
                            res.send(new Buffer(0));
                            return;
                        }
                        var tempParamID = results[0].ParamID;
                        for (var n = 1; n < size; n++) {
                            if (tempParamID != results[n].ParamID) {
                                paramNumber++;
                                tempParamID = results[n].ParamID;
                            }
                        }
                        console.log(paramNumber);
                        var buffer = new Buffer(4 + paramNumber * 8 + size * 20);
                        buffer.writeUInt32LE(paramNumber, 0);
                        offset += 4;
                        var tempCount = 0;
                        var paramIDoffset = offset;
                        offset += 8;
                        tempParamID = results[0].ParamID;
                        for (var i = 0; i < size; i++) {
                            if (tempParamID == results[i].ParamID) {
                                buffer.writeUInt32LE(results[i].ID, offset);
                                offset += 4;
                                buffer.writeDoubleLE(results[i].Time, offset);
                                offset += 8;
                                buffer.writeUInt32LE(results[i].Status, offset);
                                offset += 4;
                                buffer.writeUInt32LE(results[i].tsCode, offset);
                                offset += 4;
                                tempCount++;
                            } else {
                                buffer.writeUInt32LE(tempParamID, paramIDoffset);
                                buffer.writeUInt32LE(tempCount * 20, paramIDoffset + 4);
                                console.log('数据长度：');
                                console.log(tempCount * 20);
                                console.log('参数ID:');
                                console.log(tempParamID);
                                console.log('偏移地址：');
                                console.log(offset);
                                tempCount = 0;
                                paramIDoffset = offset;
                                tempParamID = results[i].ParamID;
                                offset += 8;
                                buffer.writeUInt32LE(results[i].ID, offset);
                                offset += 4;
                                buffer.writeDoubleLE(results[i].Time, offset);
                                offset += 8;
                                buffer.writeUInt32LE(results[i].Status, offset);
                                offset += 4;
                                buffer.writeUInt32LE(results[i].tsCode, offset);
                                offset += 4;
                                tempCount++;
                            }
                        }
                        console.log(tempCount * 20);
                        buffer.writeUInt32LE(tempParamID, paramIDoffset);
                        buffer.writeUInt32LE(tempCount * 20, paramIDoffset + 4);
                        console.log(buffer);
                        res.send(buffer);
                    }
                });
            }

            else if (paramType == NODEF_TYPE) {
                res.send(new Buffer(0));
            }
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null);
        }
    }
    async publishInstance(req, res, next) {
        try {
            let params = await this.extractFormData(req)
            let instanceID = params.id;
            let sql = 'UPDATE A_INSTANCE SET IsPublish=? WHERE ID=' + instanceID;
            let sqlSource = [1];
            let result = await this.executeSql(sql, sqlSource);
            this.sendResult(res, result);
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, null);
        }
    }
    async unpublishInstance(req, res, next) {
        try {
            let params = await this.extractFormData(req)
            let instanceID = params.id;
            let sql = 'UPDATE A_INSTANCE SET IsPublish=? WHERE ID=' + instanceID;
            let sqlSource = [0];
            let result = await this.executeSql(sql, sqlSource);
            this.sendResult(res, result);
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false')
        }
    }
    async renameInstance(req, res, next) {
        try {
            let params = await this.extractFormData(req);
            let instanceID = params.id;
            let instanceName = params.name;
            let sql = 'UPDATE A_INSTANCE SET Name=? WHERE ID=' + instanceID;
            let sqlSource = [instanceName];
            let result = await this.executeSql(sql, sqlSource);
            this.sendResult(res, result);
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false')
        }
    }
    async testConnection(req, res, next) {
        this.sendSucceed(res);
    }
    async deleteInstance(req, res, next) {
        try {
            let instanceID = this.getID(req);
            let sql = 'delete from a_instance where ID=' + instanceID;
            let result = await this.executeSql(sql);
            this.sendResult(res, result);
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false');
        }
    }

    async upLoadInstance(req, res, next) {
        let content = await this.extractBodyData(req);
        console.log("进入~~");
        console.log(content.length);
        this.sendSucceed(res);
    }

    async downloadInfo(req, res, next) {
        var readable = fs.readFileSync('E:\\下载测试\\1.zip');
        this.sendData(res, readable);
    }
}

function buildParamTree(result, paramTreeList, index) {
    for (var i = index; i < result.length; i++) {
        if (result[i].ParentID == -1) {
            var paramLeaf = {};
            paramLeaf['id'] = result[i].ID;
            paramLeaf['name'] = result[i].Name;
            paramLeaf['paramType'] = result[i].ParamType;
            paramLeaf['type'] = 'leaf';
            paramTreeList.push(paramLeaf);
        } else {
            var paramLeaf = {};
            var children = [];
            paramLeaf['name'] = result[i].Name;
            paramLeaf['type'] = 'node';
            var id = result[i].ID;
            buildChildList(id, result, children);
            paramTreeList.push(paramLeaf);
        }
    }

}


function buildChildList(id, results, children) {
    for (var i = 0; i < results.length; i++) {
        if (results[i].ParentID == id) {
            buildParamTree(results, children, i);
        }
    }
}

function buildDataCache(instanceInfoCache, results, tag) {
    for (var i = 0; i < results.length; i++) {
        var instanceInfo = {};
        instanceInfo["SystemTableName"] = results[i].SystemTableName;
        instanceInfo["ParamTableName"] = results[i].ParamTableName;
        if (tag == 1)
            instanceInfoCache[results[i].ID] = instanceInfo;
        else
            instanceInfoCache[results[i].id] = instanceInfo;
    }
}



export default new InstanceInfo()