'use strict'

import Base from './base'
import logger from '../logger/logger'


class Outlier extends Base {

    constructor() {
        super()

        this.getOutlier = this.getOutlier.bind(this);
        this.removeAllOutlier = this.removeAllOutlier.bind(this);
        this.removeOutlier = this.removeOutlier.bind(this);
        this.setOutlier = this.setOutlier.bind(this);
    }


    async getOutlier(req, res, next) {
        try {
            var instanceID = req.params.id;
            var resultList = [];
            var outlierList = [];
            var sql = 'select * from a_outlier where InstanceID=' + instanceID + ' ORDER BY ParamID';
            var results = await this.queryArray(sql)

            var paramOutlier = {};
            var preParamID = null;
            var lengths = results.length;
            if (results.length > 0) {
                var paramCode = results[0].ParamCode;
                var paramID = results[0].ParamID;
                for (var i = 0; i < results.length; i++) {

                    var tempCode = results[i].ParamCode;
                    var tempID = results[i].ParamID;
                    var outlierInfo = {};
                    outlierInfo["index"] = results[i].ParamIndex;
                    outlierInfo["time"] = results[i].Time;
                    outlierInfo["value"] = results[i].Value;

                    if (paramCode == tempCode) {
                        outlierList.push(outlierInfo);
                    }
                    else {
                        var paramOutlier = {};
                        paramOutlier["paramCode"] = paramCode;
                        paramOutlier["paramID"] = paramID;
                        paramOutlier["outliers"] = outlierList;
                        paramCode = tempCode;
                        paramID = tempID;
                        outlierList = [];
                        outlierList.push(outlierInfo);
                        resultList.push(paramOutlier);
                    }
                }
                var paramOutlier = {};
                paramOutlier["paramCode"] = paramCode;
                paramOutlier["paramID"] = paramID;
                paramOutlier["outliers"] = outlierList;
                resultList.push(paramOutlier);
                res.send(resultList);
                return;
            }
            res.send(resultList);
        }
        catch (error) {
            logger.error(error);
            res.send(null);
        }
    }

    async removeAllOutlier(req, res, next) {
        try {
            var instanceID = req.params.instanceID;
            var paramID = req.params.paramID;
            var sql = 'delete from a_outlier where InstanceID=' + instanceID + ' and ParamID=' + paramID;
            var results = await this.queryArray(sql)
            this.sendData(res, results)
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, 'false');
        }
    }

    async removeOutlier(req, res, next) {
        try {
            var instanceID = req.params.id;
            var buffer = '';
            let content = await this.extractBodyData(req);
            if (content == null) {
                this.sendFailed(res)
                return
            }
            var outlierList = JSON.parse(content);
            var paramIDList = [];
            var outliersList = outlierList[0]["outliers"];
            for (var i = 0; i < outlierList.length; i++) {
                var paramOutlier = outlierList[i];
                paramIDList.push(paramOutlier["paramID"]);
            }
            var sql = 'delete from a_outlier where InstanceID=' + instanceID + ' and ParamID in(' + paramIDList + ')' + ' and ParamIndex in(' + outliersList + ')';
            let succeed = await this.executeSql(sql);
            this.sendResult(res, succeed)
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false');
        }
    }

    async setOutlier(req, res, next) {
        try {
            var instanceID = req.params.id;
            var buffer = '';
            let content = await this.extractStringData(req);
            if (content == null) {
                this.sendFailed(res)
                return
            }
            var outlierList = JSON.parse(content);
            for (var i = 0; i < outlierList.length; i++) {
                var paramCode = outlierList[i]["paramCode"];
                var paramID = outlierList[i]["paramID"];
                var outliers = outlierList[i]["outliers"];
                for (var n = 0; n < outliers.length; n++) {
                    var index = outliers[n]["index"];
                    var time = outliers[n]["time"];
                    var value = outliers[n]["value"];
                    var sql = 'INSERT INTO  a_outlier (InstanceID,ParamID,ParamCode,ParamIndex,Time,Value) VALUES(?,?,?,?,?,?)';
                    var sqlSource = [];
                    sqlSource.push(instanceID);
                    sqlSource.push(paramID);
                    sqlSource.push(paramCode);
                    sqlSource.push(index);
                    sqlSource.push(time);
                    sqlSource.push(value);
                    console.log(sqlSource);
                    let succeed = await this.executeSql(sql, sqlSource);
                }
            }
            res.send({ state: 'true' });
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false');
        }
    }
}

export default new Outlier()