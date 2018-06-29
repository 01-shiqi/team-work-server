'use strict'

import Base from './base'
import logger from '../logger/logger'

class IPResult extends Base {

    constructor() {
        super()

        this.loadInstanceIPResult = this.loadInstanceIPResult.bind(this)
        this.loadAllInstanceIPResult = this.loadAllInstanceIPResult.bind(this)
        this.saveInstanceIPResult = this.saveInstanceIPResult.bind(this)
    }

    async loadInstanceIPResult(req, res, next) {
        try {
            let id = this.getID(req);
            let userID = this.getUserID(req);
            let sql = 'select Content as data from a_ipresult where UserID=\'' + userID + '\' and InstanceID=' + id;
            let data = await this.queryBinData(sql);
            // let data = await this.queryValue(sql);
            let reuslt = data.toString('utf-8')
            console.log(reuslt)
            this.sendData(res, { 'file': reuslt })
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, { 'file': '' })
        }
    }

    async loadAllInstanceIPResult(req, res, next) {
        var params = this.extractQueryParams(req);
    }

    async saveInstanceIPResult(req, res, next) {
        try {
            let id = this.getID(req);
 //           var params = await this.extractFormData(req);
            let params = await this.extractMultipartFromData(req);
            let userID = this.getUserID(req)
            var tempsql = 'select count(*) as count from a_ipresult where UserID=\'' + userID + '\' and InstanceID=' + id;
            var isExitTemplate = await this.exitTemplate(tempsql);
            var sql = '';
            var sqlSource = [];
            if (isExitTemplate == 0) {
                sql = 'INSERT INTO a_ipresult (UserID, InstanceID, TotalParamCount, RightParamCount, Content) VALUES(?,?,?,?,?)';
                sqlSource.push(userID);
                sqlSource.push(parseInt(id));
            }
            else {
                sql = 'UPDATE a_ipresult SET TotalParamCount = ?, RightParamCount = ?, Content = ? where UserID=\'' + userID + '\' and InstanceID=' + id;
            }
            sqlSource.push(parseInt(params.fields.totalParamCount))
            sqlSource.push(parseInt(params.fields.rightParamCount))
            sqlSource.push(params.file.source);
            console.log("当前存储的判读结果总个数：");
            console.log(params.fields.totalParamCount);
            console.log("当前存储的判读结果正确个数：");
            console.log(params.fields.rightParamCount);
            console.log("当前存储的判读结果:");
            console.log(params.file.source);
            let succeed = await this.executeSql(sql, sqlSource);
            this.sendResult(res, succeed)
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false')
        }
    }
}

export default new IPResult()