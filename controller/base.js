import db from '../db/db'
import url from 'url'
import formidable from 'formidable'
import uuidv4 from 'uuid/v4'
import config from 'config-lite';
import fs from 'fs';
import logger from '../logger/logger';

class Base {

    constructor() {

        this.succeed = { succeed: true }
        this.failed = { succeed: false }

        this.DATABASE = config.database

        this.uuid = this.uuid.bind(this)
        this.genCondition = this.genCondition.bind(this)
        this.genStrCondition = this.genStrCondition.bind(this)

        this.queryArray = this.queryArray.bind(this)
        this.queryFields = this.queryFields.bind(this)
        this.queryValue = this.queryValue.bind(this)
        this.queryBinData = this.queryBinData.bind(this)
        this.executeSql = this.executeSql.bind(this)

        this.extractQueryParams = this.extractQueryParams.bind(this)
        this.extractParams = this.extractParams.bind(this)
        this.extractBodyData = this.extractBodyData.bind(this)
        this.extractFormData = this.extractFormData.bind(this)
        this.extractMultipartFromData = this.extractMultipartFromData.bind(this)

        this.sendSucceed = this.sendSucceed.bind(this)
        this.sendFailed = this.sendFailed.bind(this)
        this.sendResult = this.sendResult.bind(this)
        this.sendData = this.sendData.bind(this)
        this.sendError = this.sendError.bind(this)

        this.callFunc = this.callFunc.bind(this)

        this.exitTemplate = this.exitTemplate.bind(this)
        this.extractStringData = this.extractStringData.bind(this)

        this.getUserID = this.getUserID.bind(this)
        this.getID = this.getID.bind(this)

        this.appendUserInfo = this.appendUserInfo.bind(this)

        this.isSuperAdmin = this.isSuperAdmin.bind(this)
        this.isAdmin = this.isAdmin.bind(this)

        this.loadBasicInfo = this.loadBasicInfo.bind(this)
        this.loadAllBasicInfos = this.loadAllBasicInfos.bind(this)
        this.loadTasks = this.loadTasks.bind(this)
    }


    /**
     * 加载任务信息
     * @param {*用户ID} userID 
     * @param {*是否加载所有执行人的用户} allExecutors 
     * @param {*是否包含关闭状态的任务} containClosedState 
     * @param {*是出差类型任务还是其他类型任务} isTripType 
     */
    async loadTasks(userID, allExecutors, containClosedState, isTripType) {
        try {
            let sql = 'select id, `name`, model, type as type, work_object as workObject, work_place as workPlace, begin_time as beginTime, end_time as endTime, progress from tw_task where state != \'已创建\' '
            if(!containClosedState) {
                sql += ' and state != \'已关闭\' '
            }
            if(isTripType) {
                sql += ' and type = \'出差\' '
            } else {
                sql += ' and type != \'出差\' '
            }
            if(!allExecutors) {
                sql += ' and ' + this.genStrCondition('executor_id', userID)
            }
            sql += ' order by `name`'
            let tasks = await this.queryArray(sql)
            return tasks
        }
        catch (error) {
            return []
        }
    }

    /**
     * 加载基本信息
     * @param {*} tableName 
     */
    async loadBasicInfo(tableName) {
        try {
            var sql = 'select `name` from ' + tableName +  ' order by `order`'
            var basicInfos = await this.queryArray(sql)
            return basicInfos
        }
        catch (error) {
            return []
        }
    }

    async loadAllBasicInfos() {

        let basicInfos = {}

        basicInfos.workTimes = await this.loadBasicInfo('tw_work_time')
        basicInfos.workTypes = await this.loadBasicInfo('tw_work_type')
        basicInfos.models = await this.loadBasicInfo('tw_model')
        basicInfos.workPlaces = await this.loadBasicInfo('tw_work_place')
        basicInfos.workObjects = await this.loadBasicInfo('tw_work_object')

        return basicInfos
    }    


    callFunc(funcName) {
        var the = this
        return function (req, res, next) {
            try {
                var func = the[funcName]
                func(req, res, next)
            } catch (err) {
                the.sendError(res, err)
            }
        }
    }

    /**
     * 向返回给前端的数据中增加用户信息
     * @param {*} data 
     */
    appendUserInfo(req, data){
        if(!data){
            data = {}
        }
        data.trueName = req.session.true_name
        data.jobPosition = req.session.job_position
        data.role = req.session.role

        return data
    }

    /**
     * 从请求的会话中提取userID
     * @param {*} req 
     */
    getUserID(req) {
        return req.session.user_id
    }

    /**
     * 从请求的路径中提取ID
     * @param {*} req 
     */
    getID(req) {
        return req.params.id
    }

    /**
     * 从请求中解析查询参数
     * @param {*} req 
     */
    extractQueryParams(req) {
        return url.parse(req.url, true).query;
    }

    extractParams(req) {
        return req.params
    }

    /**
     * 是否为管理员
     * @param {} req 
     */
    isAdmin(req) {
        let role = req.session.role
        return role < 10
    }

    /**
     * 是否为超级管理员
     * @param {*} req 
     */
    isSuperAdmin(req) {
        let role = req.session.role
        return role <= 0
    }

    /**
     * 从请求的请求体中提取数据
     * @param {*} req 
     */
    async extractBodyData(req) {

        return new Promise(function (resolve, reject) {

            let chunks = [];
            let size = 0;
            req.on('data', function (chunk) {
                chunks.push(chunk);
                size += chunk.length;
            });
            req.on('end', function () {
                var buffer = Buffer.concat(chunks, size);
                resolve(buffer)
            });
            req.on('error', function (err) {
                reject(null)
            })
        })
    }

    /**
    * 从请求的请求体中提取数据
    * @param {*} req 
    */
    async extractStringData(req) {

        return new Promise(function (resolve, reject) {

            let buffer = '';
            req.on('data', function (chunk) {
                buffer += chunk;
            });
            req.on('end', function () {
                resolve(buffer)
            });
            req.on('error', function (err) {
                reject(null)
            })
        })
    }

    /**
     * 从请求中解析表单数据
     * @param {*} req 
     */
    async extractFormData(req) {

        req.setEncoding('utf8')

        return new Promise(function (resolve, reject) {
            let form = new formidable.IncomingForm();
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    logger.error(err);
                    reject(err)
                }
                resolve(fields)
            })
        })
    }

    /**
     * 从请求中解析多表单数据
     * @param {*} req 
     */
    async extractMultipartFromData(req) {

        return new Promise(function (resolve, reject) {
            let form = new formidable.IncomingForm();
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    logger.error(err);
                    reject(err)
                }
                let result = {};
                let file = {};
                result.fields = fields;
                let path = files.file.path;
                let name = files.file.name;
                let fileSource = fs.readFileSync(path, 'utf-8');
                file.name = name;
                file.source = fileSource;
                result.file = file;
                resolve(result)
            })
        })
    }

    /**
     * 从数据库查询，返回二进制数据
     * @param {*} req 
     */
    async queryArray(sql) {
        db.connection().query('use ' + this.DATABASE);

        return new Promise(function (resolve, reject) {
            db.connection().query(sql, function (error, results) {
                if (error) {
                    logger.error(error);
                    needReconnect(error);
                    reject([]);
                } else {
                    resolve(results);
                }
            })
        })
    }

    /**
     * 从数据库查询，返回表单数据
     * @param {*} req 
     */
    async queryFields(sql) {
        db.connection().query('use ' + this.DATABASE);

        return new Promise(function (resolve, reject) {
            db.connection().query(sql, function (error, results, fields) {
                if (error) {
                    logger.error(error);
                    needReconnect(error);
                    reject([]);
                } else {
                    let result = {};
                    result['results'] = results;
                    result['fields'] = fields;
                    resolve(result);
                }
            })
        })
    }

    /**
     * 从数据库查询，返回值
     * @param {*} req 
     */
    async queryValue(sql) {
        db.connection().query('use ' + this.DATABASE);

        return new Promise(function (resolve, reject) {
            db.connection().query(sql, function (error, results) {
                if (error) {
                    logger.error(error);
                    needReconnect(error);
                    reject(error);
                } else {
                    var result = results.length <= 0 ? null : results[0].value
                    resolve(result);
                }
            })
        })
    }

    /**
     * 查询二进制数据
     * @param {*} sql 
     */
    async queryBinData(sql) {

        db.connection().query('use ' + this.DATABASE);

        return new Promise(function (resolve, reject) {
            db.connection().query(sql, function (error, results) {
                if (error) {
                    logger.error(error);
                    needReconnect(error);
                    reject(null);
                } else {
                    if (results == null || results.length <= 0 || results[0].data == null) {
                        var buffer = new Buffer(0)
                    } else {
                        var buffer = new Buffer(results[0].data, 'utf-8');
                    }
                    resolve(buffer);
                }
            })
        })
    }

    /**
     * 执行SQL语句, 成功返回true,失败返回false
     * @param {*} sql 
     * @param {*} paramValues 
     */
    async executeSql(sql, paramValues) {
        db.connection().query('use ' + this.DATABASE);
        return new Promise(function (resolve, reject) {
            db.connection().query(sql, paramValues, function (error, results) {
                if (error) {
                    logger.error(error);
                    needReconnect(error);
                    reject(error);
                } else {
                    resolve(true);
                }
            })
        })
    }

    /**
     * 执行SQL语句,查询是否存在名称
     * @param {*} sql 
     * @param {*} paramValues 
     */
    async exitTemplate(sql) {
        db.connection().query('use ' + this.DATABASE);
        return new Promise(function (resolve, reject) {
            db.connection().query(sql, function (error, results, fields) {
                if (error) {
                    logger.error(error);
                    needReconnect(error);
                    console.log(error);
                } else {
                    resolve(results[0].count)
                }
            });
        })
    }

    /**
     * 生成新的uuid
     */
    uuid() {
        return uuidv4();
    }

    sendFailed(res, error) {
        if(error != undefined) {
            this.failed.error = error;
        }
        res.send(this.failed)
    }

    sendSucceed(res, id) {
        if (id != undefined) {
            this.succeed.id = id
        }
        res.send(this.succeed)
    }

    sendResult(res, succeed, id) {
        if (succeed) {
            this.sendSucceed(res, id)
        } else {
            this.sendFailed(id)
        }
    }

    sendData(res, data) {
        res.send(data)
    }

    sendError(req, error) {
        console.log('Fatal Error: ' + error)
        res.end()
    }

    genCondition(id) {
        return 'ID= \'' + id + '\''
    }

    genStrCondition(name, value) {
        return name + ' = \'' + value + '\''
    }

}

function needReconnect(error)
{
    if(error.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR')
        db.reconnect();
}
export default Base