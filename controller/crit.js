'use strict'

import Base from './base'
import logger from '../logger/logger';

class Crit extends Base {

    constructor() {
        super()

        this.getCritsFiles = this.getCritsFiles.bind(this)
        this.getCritContent = this.getCritContent.bind(this)
        this.saveCrit = this.saveCrit.bind(this)
        this.addCrit = this.addCrit.bind(this)
        this.renameCrit = this.renameCrit.bind(this)
        this.deleteCrit = this.deleteCrit.bind(this)
    }

    async getCritsFiles(req, res, next) {

        try {
            var userID = this.getUserID(req);
            var sql = 'select id, critName as name, TestState as testState, IsPrivate as isPrivate, systemName as system, modelName as model, descr, integrated from a_crit where ' + this.genStrCondition('UserID', userID) + ' or isPrivate = 0';
            var results = await this.queryArray(sql);
            this.sendData(res, results);
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, []);
        }
    }

    async addCrit(req, res, next) {
        try {
            var params = await this.extractFormData(req)
            const id = this.uuid()
            const userID = this.getUserID(req)
            const critName = params.name;
            const modelName = params.model;
            const systemName = params.system;
            const testState = params.testState;
            const isPrivate = params.isPrivate;
            const descr = params.descr;
            var sql = 'INSERT INTO a_crit (ID, UserID, CritName, TestState, IsPrivate, systemName, modelName, descr) VALUES(?,?,?,?,?,?,?,?)'
            var sqlSource = [];
            sqlSource.push(id)
            sqlSource.push(userID)
            sqlSource.push(critName)
            sqlSource.push(testState)
            sqlSource.push(isPrivate)
            sqlSource.push(systemName)
            sqlSource.push(modelName)
            sqlSource.push(descr)

            let succeed = await this.executeSql(sql, sqlSource)
            this.sendResult(res, succeed, id);
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false', id);
        }
    }

    async getCritContent(req, res, next) {
        try {
            let id = this.getID(req)
            let sql = 'select Content as data from a_crit where ' + this.genCondition(id)

            let data = await this.queryBinData(sql)
            this.sendData(res, data)
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null)
        }
    }

    async saveCrit(req, res, next) {
        try {
            let id = this.getID(req)
            let critContent = await this.extractBodyData(req)
            if (critContent == null) {
                this.sendFailed(res)
                return
            }
            let sql = 'UPDATE a_crit SET Content=? WHERE ' + this.genCondition(id)
            let sqlSource = [];
            sqlSource.push(critContent);
            let succeed = await this.executeSql(sql, sqlSource);
            this.sendResult(res, succeed)
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, 'false')
        }
    }

    async deleteCrit(req, res, next) {
        try {
            let id = this.getID(req)
            let sql = 'delete from a_crit where ' + this.genCondition(id)
            let succeed = await this.executeSql(sql);
            this.sendResult(res, succeed)
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false');
        }
    }

    async renameCrit(req, res, next) {
        try {
            var params = await this.extractFormData(req)
            let id = this.getID(req)
            const critName = params.name;
            const modelName = params.model;
            const systemName = params.system;
            const testState = params.testState;
            const isPrivate = params.isPrivate;
            const descr = params.descr;
            let sql = 'UPDATE a_crit SET CritName=?, TestState=?, IsPrivate=?, systemName=?, modelName=?, descr=? WHERE ' + this.genCondition(id)

            var sqlSource = [];
            sqlSource.push(critName);
            sqlSource.push(testState)
            sqlSource.push(isPrivate)
            sqlSource.push(systemName)
            sqlSource.push(modelName)
            sqlSource.push(descr)

            let succeed = await this.executeSql(sql, sqlSource);
            this.sendResult(res, succeed)
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false');
        }
    }

}

export default new Crit()