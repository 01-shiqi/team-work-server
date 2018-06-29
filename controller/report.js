'use strict'

import Base from './base'
import logger from '../logger/logger'

class Report extends Base {

    constructor() {
        super()

        this.downloadReports = this.downloadReports.bind(this)
        this.loadReport = this.loadReport.bind(this)
        this.uploadReport = this.uploadReport.bind(this)
        this.deleteReport = this.deleteReport.bind(this)
        this.createReport = this.createReport.bind(this)
    }
    async downloadReports(req, res, next) {
        try {
            const userID = this.getUserID(req);
            const ReportID = this.getID(req);
            var sql = 'select ReportContent as data from a_report where ' + this.genStrCondition('UserID', userID) + '  and ' + this.genStrCondition('ID', ReportID);

            var data = await this.queryBinData(sql);
            this.sendData(res, data)
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null);
        }
    }

    async loadReport(req, res, next) {
        try {
            const userID = this.getUserID(req);
            var sql = 'select ID as id, ReportName as name, integrated from a_report where ' + this.genStrCondition('UserID', userID);

            var results = await this.queryArray(sql)
            this.sendData(res, results)
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null);
        }
    }

    async uploadReport(req, res, next) {
        try {
            const userID = this.getUserID(req);
            const ReportID = req.params.id;
            let reportContent = await this.extractBodyData(req);
            if (reportContent == null) {
                this.sendFailed(res)
                return
            }
            let size = reportContent.length;
            for (let i = size - 10; i < size; i++)
                console.log(reportContent[i]);
            var sql = '';
            var sqlSource = [];
            sql = 'UPDATE a_report set ReportContent=? where ' + this.genStrCondition('UserID', userID) + '  and ' + this.genStrCondition('ID', ReportID);
            sqlSource.push(reportContent);

            let test = reportContent.length;
            let succeed = await this.executeSql(sql, sqlSource);
            this.sendResult(res, succeed)
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false');
        }
    }

    async deleteReport(req, res, next) {
        try {
            const userID = this.getUserID(req);
            const ReportID = req.params.id;
            var sql = 'delete from a_report where ' + this.genStrCondition('UserID', userID) + '  and ' + this.genStrCondition('ID', ReportID);

            let succeed = await this.executeSql(sql);
            this.sendResult(res, succeed)
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false');
        }
    }

    async createReport(req, res, next) {
        try {
            var params = await this.extractFormData(req);
            const id = this.uuid();
            const userID = this.getUserID(req);
            const reportName = params.name;
            var sqlSource = [];
            var sql = 'INSERT INTO  a_report (ID,UserID,ReportName) VALUES(?,?,?)';
            sqlSource.push(id);
            sqlSource.push(userID);
            sqlSource.push(reportName);

            let succeed = await this.executeSql(sql, sqlSource);
            this.sendResult(res, succeed, id);
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false', id);
        }
    }
}

export default new Report()