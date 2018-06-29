'use strict'

import Base from './base'
import logger from '../logger/logger'

const EXT_EXPECTED_CURVE = 'expectedCurves';
const EXT_ENVELOPE_CURVE = 'envelopeCurves';

class Files extends Base {

    constructor() {
        super()

        this.createParamSettingFile = this.createParamSettingFile.bind(this)
        this.loadParamSettingFiles = this.loadParamSettingFiles.bind(this)
        this.loadParamSettingFile = this.loadParamSettingFile.bind(this)
        this.renameParamSettingFile = this.renameParamSettingFile.bind(this)
        this.removeParamSettingFile = this.removeParamSettingFile.bind(this)
        this.saveParamSettingFile = this.saveParamSettingFile.bind(this)
        this.load = this.load.bind(this)
    }

    async createParamSettingFile(req, res, next) {
        try {
            var form = await this.extractFormData(req);
            var paramFileType = req.params.paramFileType;
            const id = this.uuid();
            var sql = '';
            const userID = await this.getUserID(req);
            if (paramFileType == EXT_EXPECTED_CURVE)//理论曲线
                sql = 'INSERT INTO a_expectedCurve (ID,UserID,Name) VALUES(?,?,?)';
            else if (paramFileType == EXT_ENVELOPE_CURVE)//包络曲线
                sql = 'INSERT INTO a_envelopeCurve (ID,UserID,Name) VALUES(?,?,?)';
            var sqlSource = [];
            sqlSource.push(id);
            sqlSource.push(userID);
            sqlSource.push(form.name);
            let succeed = await this.executeSql(sql, sqlSource);
            this.sendResult(res, succeed, id);
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false', id);
        }
    }

    async loadParamSettingFiles(req, res, next) {
        try {
            var paramFileType = req.params.paramFileType;
            const userID = await this.getUserID(req);
            var sql = '';
            if (paramFileType == EXT_EXPECTED_CURVE)//理论曲线
                sql = 'select id, Name as name, integrated from a_expectedCurve where UserID=\'' + userID + '\'';
            else if (paramFileType == EXT_ENVELOPE_CURVE)//包络曲线
                sql = 'select id, Name as name, integrated from a_envelopeCurve where UserID=\'' + userID + '\'';

            var results = await this.queryArray(sql)
            this.sendData(res, results)
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null);
        }
    }

    async loadParamSettingFile(req, res, next) {
        try {
            var paramFileType = req.params.paramFileType;
            var id = req.params.id;
            const userID = await this.getUserID(req);
            var sql = '';
            if (paramFileType == EXT_EXPECTED_CURVE)//理论曲线
                sql = 'select Content as data from a_expectedCurve where UserID=\'' + userID + '\' and id=\'' + id + '\'';
            else if (paramFileType == EXT_ENVELOPE_CURVE)//包络曲线
                sql = 'select Content as data from a_envelopeCurve where UserID=\'' + userID + '\' and id=\'' + id + '\'';
            var data = await this.queryBinData(sql);
            this.sendData(res, data)
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null);
        }
    }

    async renameParamSettingFile(req, res, next) {
        try {
            var paramFileType = req.params.paramFileType;
            var fileName = await this.extractFormData(req);
            var id = req.params.id;
            const userID = await this.getUserID(req);
            var sql = '';
            if (paramFileType == EXT_EXPECTED_CURVE)//理论曲线
                sql = 'UPDATE a_expectedCurve set Name=? where UserID=\'' + userID + '\' and id=\'' + id + '\'';
            else if (paramFileType == EXT_ENVELOPE_CURVE)//包络曲线
                sql = 'UPDATE a_envelopeCurve set Name=? where UserID=\'' + userID + '\' and id=\'' + id + '\'';
            var sqlSource = [fileName.name];
            var temp = fileName.name;
            let succeed = await this.executeSql(sql, sqlSource);
            this.sendResult(res, succeed)
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, 'false');
        }
    }

    async removeParamSettingFile(req, res, next) {
        try {
            var paramFileType = req.params.paramFileType;
            const userID = await this.getUserID(req);
            var id = req.params.id;
            var sql = '';
            if (paramFileType == EXT_EXPECTED_CURVE)//理论曲线
                sql = 'delete from a_expectedCurve where UserID=\'' + userID + '\' and id=\'' + id + '\'';
            else if (paramFileType == EXT_ENVELOPE_CURVE)//包络曲线
                sql = 'delete from a_envelopeCurve where UserID=\'' + userID + '\' and id=\'' + id + '\'';
            let succeed = await this.executeSql(sql);
            this.sendResult(res, succeed)
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false')
        }
    }

    async saveParamSettingFile(req, res, next) {
        try {
            var paramFileType = req.params.paramFileType;
            var id = req.params.id;
            const userID = await this.getUserID(req);
            var sql = '';
            if (paramFileType == EXT_EXPECTED_CURVE)//理论曲线
                sql = 'UPDATE a_expectedCurve SET Content=? WHERE UserID=\'' + userID + '\' AND id=\'' + id + '\'';
            else if (paramFileType == EXT_ENVELOPE_CURVE)//包络曲线
                sql = 'UPDATE a_envelopeCurve SET Content=? WHERE UserID=\'' + userID + '\' AND id=\'' + id + '\'';

            let fileContent = await this.extractBodyData(req);
            var sqlSource = [];
            sqlSource.push(fileContent);
            let succeed = await this.executeSql(sql, sqlSource);
            this.sendResult(res, succeed)
        }
        catch (error) {
            logger.error(error);
            this.sendResult(res, 'false');
        }
    }

    async load(req, res, next) {
        try {
            var paramFileType = req.params.paramFileType;
            var fileName = req.params.fileName;
            const userID = await this.getUserID(req);

            var sql = '';
            if (paramFileType == EXT_EXPECTED_CURVE)//理论曲线
                sql = 'select Content as data from a_expectedCurve where UserID=\'' + userID + '\' and Name=\'' + fileName + '\'';
            else if (paramFileType == EXT_ENVELOPE_CURVE)//包络曲线
                sql = 'select Content as data from a_envelopeCurve where UserID=\'' + userID + '\' and Name=\'' + fileName + '\'';
            var data = await this.queryBinData(sql);
            this.sendData(res, data)
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null)
        }
    }
}
export default new Files()