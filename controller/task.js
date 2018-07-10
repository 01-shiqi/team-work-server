'use strict'

import Base from './base'
import logger from '../logger/logger'

import moment from 'moment'


class Task extends Base {

    constructor() {
        super()

        this.createTask = this.createTask.bind(this)
        this.manageTasks = this.manageTasks.bind(this)
        this.getMyTasks = this.getMyTasks.bind(this)
        this.getTaskList = this.getTaskList.bind(this)
        this.commitWorklog = this.commitWorklog.bind(this)
        this.updateWorklog = this.updateWorklog.bind(this)
        this.deleteWorklogs = this.deleteWorklogs.bind(this)
        this.loadBasicInfo = this.loadBasicInfo.bind(this)
        this.loadAllBasicInfos = this.loadAllBasicInfos.bind(this)
    }

   // 创建任务
   async createTask(req, res, next) {

    try {
        let bodyData = await this.extractStringData(req)
        let task = JSON.parse(bodyData)
        const id = this.uuid()
        const userID = this.getUserID(req)          
        var sqlSource = []
        sqlSource.push(id)
        sqlSource.push(task.type)
        sqlSource.push(task.model)
        sqlSource.push(task.beginTime)
        sqlSource.push(task.endTime)
        sqlSource.push(task.personHours)
        sqlSource.push(task.executor)
        sqlSource.push(task.name)
        sqlSource.push(task.content)
        sqlSource.push('已创建')

        var now = moment().format('YYYY-MM-DD hh:mm:ss')
        sqlSource.push(now)
        sqlSource.push(userID)
        sqlSource.push(now)
        sqlSource.push(userID)

        var sql = 'insert into tw_task ' + 
                  'values(?,?,?,?, ?,?,?,?, ?,?,?,?, ?,?)'

        let succeed = await this.executeSql(sql, sqlSource)
        this.sendSucceed(res)
    }
    catch (error) {
        logger.error(error)
        this.sendFailed(res, error.message)
    }
}

    async writeWorklog(req, res, next) {
        let basicInfos = await this.loadAllBasicInfos()
        res.render('write-worklog', this.appendUserInfo(req, basicInfos))
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

    /**
     * 加载普通用户信息
     * @param {*} tableName 
     */
    async loadUsers() {
        try {
            var sql = 'select id, true_name as name from tw_user where role >= 10 order by name'
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
        basicInfos.users = await this.loadUsers()

        return basicInfos
    }

    // 获取管理日志列表
    async manageTasks(req, res, next) {
        await this.getTaskList(req, res, next, true)
    }
  
    // 获取我的日志列表
    async getMyTasks(req, res, next) {  
        await this.getTaskList(req, res, next, false)
    }

    // 获取日志列表
    async getTaskList(req, res, next, allusers) {

        try {
            let params = await this.extractQueryParams(req)
            let pageIndex = params.pageIndex || 0

            const countPerPage = 12

            let whereClause = ''
            const userID = this.getUserID(req)
            if(userID && !allusers){
                whereClause += this.genStrCondition('user_id', userID);
            }
            if(whereClause != '') {
                whereClause = ' where ' + whereClause
            }

            let totalCountSql = 'select count(*) as value from tw_task ' + whereClause
            let totalCount = await this.queryValue(totalCountSql)

            let startIndex = pageIndex * countPerPage

            let pageCount = Math.ceil(totalCount / countPerPage)

            let sql = 'select tw_task.id, type, name, content, state, model, begin_time as beginTime, end_time as endTime, person_hours as personHours '
            sql += ', b.true_name as executorName '
            if(allusers) {
                sql += ', c.true_name as creatorName '
            } 

            sql += ' from tw_task left join tw_user b on (tw_task.executor_id = b.id) '
            if(allusers) {
                sql += ' left join tw_user c on (tw_task.created_by = c.id) '
            }

            sql += whereClause 
                + ' order by created_at desc '
                + ' limit ' + startIndex + ',' + countPerPage

            let resultData = await this.loadAllBasicInfos()
            resultData.tasks = await this.queryArray(sql)
            resultData.pageCount = pageCount
            resultData.pageIndex = pageIndex
            let viewName = allusers ? 'manage-tasks' : 'my-tasks'
            res.render(viewName,  this.appendUserInfo(req, resultData))
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }

    // 新增日志
    async commitWorklog(req, res, next) {

        try {
            let bodyData = await this.extractStringData(req)
            let worklog = JSON.parse(bodyData)
            const id = this.uuid()
            const userID = this.getUserID(req)          
            var sqlSource = []
            sqlSource.push(id)
            sqlSource.push(userID)
            sqlSource.push(worklog.workDate)
            sqlSource.push(worklog.workBeginTime)
            sqlSource.push(worklog.workTimeLength)
            sqlSource.push(worklog.workType)
            sqlSource.push(worklog.model)
            sqlSource.push(worklog.workPlace)
            sqlSource.push(worklog.workObject)
            sqlSource.push(worklog.workContent)

            var now = moment().format('YYYY-MM-DD hh:mm:ss')
            sqlSource.push(now)
            sqlSource.push(now)

            var sql = 'insert into tw_worklog (id, user_id, work_date, work_begin_time, work_time_length, work_type, model, work_place, work_object, work_content, created_at, updated_at) ' + 
                      'values(?,?,?,?,?,?,?,?,?,?,?,?)'

            let succeed = await this.executeSql(sql, sqlSource)
            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }

    // 修改日志
    async updateWorklog(req, res, next) {

        try {
            let bodyData = await this.extractStringData(req)
            let worklogItems = JSON.parse(bodyData)
            
            let worklogID = worklogItems[worklogItems.length - 1]

            let sql = 'update tw_worklog set work_date=? , work_begin_time=?, work_time_length=?, work_type=?, model=?, work_place=?, work_object=?, work_content=?, updated_at=? where ' 
                    + this.genStrCondition('id', worklogID)

            // 最后一个参数worklogID不添加至sqlData中
            let sqlData = []
            for(var i = 0; i < worklogItems.length - 1; ++i){
                sqlData.push(worklogItems[i])
            }
            let now = moment().format('YYYY-MM-DD hh:mm:ss')
            sqlData.push(now)
            sqlData.push(worklogID)

            let succeed = await this.executeSql(sql, sqlData);
            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }

    // 删除日志
    async deleteWorklogs(req, res, next) {
        try {
            let bodyData = await this.extractStringData(req)
            let ids = JSON.parse(bodyData)

            let deletingIds = ''
            for(let i = 0; i < ids.length; ++i) {
                let deletingId = '\'' + ids[i] + '\''
                deletingIds += deletingId
                if(i < ids.length - 1) {
                    deletingIds += ','
                }
            }

            let sql = 'delete from tw_worklog where id in ( ' + deletingIds + ' )';

            let succeed = await this.executeSql(sql);
            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }
}


export default new Task()