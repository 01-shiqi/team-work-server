'use strict'

import Base from './base'
import logger from '../logger/logger'

class Template extends Base {

    constructor() {
        super()

        this.getTemplateNames = this.getTemplateNames.bind(this);
        this.getCurTemplate = this.getCurTemplate.bind(this);
        this.saveCurTemplate = this.saveCurTemplate.bind(this);
        this.saveTemplate = this.saveTemplate.bind(this);
        this.getTemplate = this.getTemplate.bind(this);
        this.renameTemplate = this.renameTemplate.bind(this);
        this.delTemplate = this.delTemplate.bind(this);
        this.createTemplate = this.createTemplate.bind(this);
        this.exitTemplate = this.exitTemplate.bind(this);
    }

    async getTemplateNames(req, res, next) {
        try {
            const userID = await this.getUserID(req);
            var sql = 'select id, Name as name, integrated from a_template where UserID=\'' + userID + '\'';

            var results = await this.queryArray(sql);
            this.sendData(res, results);
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null);
        }
    }

    async getCurTemplate(req, res, next) {
        try {
            const userID = await this.getUserID(req);
            var sql = 'select id, Name as name from a_template where UserID=\'' + userID + '\' and IsDefault=1';
            var results = await this.queryValue(sql);
            this.sendData(res, results);
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null);
        }
    }

    async saveCurTemplate(req, res, next) {
        try {
            var id = req.params.id;
            var deleSql = 'UPDATE a_template SET IsDefault=0 where IsDefault=1';
            const userID = await this.getUserID(req);
            var state = await this.queryArray(deleSql);
            var sql = 'UPDATE a_template SET IsDefault=? where UserID=\'' + userID + '\' and id=\'' + id + '\'';
            var sqlSource = [1];
            let succeed = await this.executeSql(sql, sqlSource);
            this.sendResult(res, succeed)
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false');
        }
    }

    async saveTemplate(req, res, next) {
        try {
            var id = req.params.id;
            const userID = await this.getUserID(req);
            var sqlSource = [];
            var sql = 'UPDATE a_template SET Content=? WHERE UserID=\'' + userID + '\' AND id=\'' + id + '\'';
            let critContent = await this.extractBodyData(req);
            if (critContent == null) {
                this.sendFailed(res)
                return
            }
            sqlSource.push(critContent);
            let succeed = await this.executeSql(sql, sqlSource);
            this.sendResult(res, succeed)
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false');
        }
    }

    async createTemplate(req, res, next) {
        try {
            var params = await this.extractFormData(req);
            const userID = await this.getUserID(req);
            const id = await this.uuid();
            var sqlSource = [];

            var sql = 'INSERT INTO a_template (ID,UserID, Name) VALUES(?,?,?)';
            sqlSource.push(id);
            sqlSource.push(userID);
            sqlSource.push(params.name);

            let succeed = await this.executeSql(sql, sqlSource);
            this.sendResult(res, succeed, id);
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false', id);
        }
    }

    async getTemplate(req, res, next) {
        try {
            const userID = await this.getUserID(req);
            var id = req.params.id;
            var sql = 'select Content as data from a_template where UserID=\'' + userID + '\' and id=\'' + id + '\'';
            var data = await this.queryBinData(sql)
            this.sendData(res, data)
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null);
        }
    }

    async renameTemplate(req, res, next) {
        try {
            const userID = await this.getUserID(req);
            var params = await this.extractFormData(req);
            var id = req.params.id;
            var sql = 'UPDATE a_template set Name=? where UserID=\'' + userID + '\' and id=\'' + id + '\'';
            var sqlSource = [params.name];
            let succeed = await this.executeSql(sql, sqlSource);
            this.sendResult(res, succeed)
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false');
        }
    }

    async delTemplate(req, res, next) {
        try{var id = req.params.id;
        const userID = await this.getUserID(req);
        var sql = 'delete from a_template where UserID=\'' + userID + '\' and id=\'' + id + '\'';
        let succeed = await this.executeSql(sql);
        this.sendResult(res, succeed)}
        catch(error){
            logger.error(error);
            this.sendResult(res, 'false');
        }
    }
}

export default new Template()