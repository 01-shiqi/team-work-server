'use strict'

import Base from './base'
import logger from '../logger/logger'

import moment from 'moment'


class Task extends Base {

    constructor() {
        super()

        this.manageTasks = this.manageTasks.bind(this)
        this.createTask = this.createTask.bind(this)
        this.updateTask = this.updateTask.bind(this)
        this.verifyTask = this.verifyTask.bind(this)
        this.deleteTasks = this.deleteTasks.bind(this)
        this.getMyTasks = this.getMyTasks.bind(this)
        this.getTaskList = this.getTaskList.bind(this)
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

            var sql = 'insert into tw_task (id, type, model, begin_time, end_time, person_hours, executor_id, name, content, state, created_at, created_by, updated_at, updated_by)' +
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
            var sql = 'select `name` from ' + tableName + ' order by `order`'
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

    // 获取任务列表
    async manageTasks(req, res, next) {
        await this.getTaskList(req, res, next, true)
    }

    // 获取我的任务列表
    async getMyTasks(req, res, next) {
        await this.getTaskList(req, res, next, false)
    }

    // 获取任务列表
    async getTaskList(req, res, next, allusers) {

        try {
            let params = await this.extractQueryParams(req)
            let pageIndex = params.pageIndex || 0

            const countPerPage = 12

            let whereClause = ''
            const userID = this.getUserID(req)
            if (userID && !allusers) {
                whereClause += this.genStrCondition('user_id', userID);
            }
            if (whereClause != '') {
                whereClause = ' where ' + whereClause
            }

            let totalCountSql = 'select count(*) as value from tw_task ' + whereClause
            let totalCount = await this.queryValue(totalCountSql)

            let startIndex = pageIndex * countPerPage

            let pageCount = Math.ceil(totalCount / countPerPage)

            let sql = 'select tw_task.id, type, name, content, state, model, begin_time as beginTime, end_time as endTime, person_hours as personHours, progress '
            sql += ', b.true_name as executorName, b.id as executorID '
            if (allusers) {
                sql += ', c.true_name as creatorName '
            }

            sql += ' from tw_task left join tw_user b on (tw_task.executor_id = b.id) '
            if (allusers) {
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
            res.render(viewName, this.appendUserInfo(req, resultData))
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }

    // 修改任务
    async updateTask(req, res, next) {

        try {
            let bodyData = await this.extractStringData(req)
            let task = JSON.parse(bodyData)

            if(task.state != '已创建' && !this.isSuperAdmin(req)) {
                this.sendFailed(res, '任务已下发，无法修改')
                return
            }

            const id = this.uuid()
            const userID = this.getUserID(req)
            var sqlSource = []
            sqlSource.push(task.type)
            sqlSource.push(task.model)
            sqlSource.push(task.beginTime)
            sqlSource.push(task.endTime)
            sqlSource.push(task.personHours)
            sqlSource.push(task.executor)
            sqlSource.push(task.name)
            sqlSource.push(task.content)

            var now = moment().format('YYYY-MM-DD hh:mm:ss')
            sqlSource.push(now)
            sqlSource.push(userID)

            let sql = 'update tw_task set type=? , model=?, begin_time=?, end_time=?, person_hours=?, executor_id=?, name=?, content=?, updated_at=?, updated_by=? where '
                + this.genStrCondition('id', task.id)

            let succeed = await this.executeSql(sql, sqlSource);
            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }

    
    /**
     * 审核任务
     */
    async verifyTask(req, res, next) {

        try {
            let bodyData = await this.extractStringData(req)
            let task = JSON.parse(bodyData)
            const id = this.uuid()
            const userID = this.getUserID(req)
            var sqlSource = []
            sqlSource.push(task.executor)
            sqlSource.push('已下发')

            var now = moment().format('YYYY-MM-DD hh:mm:ss')
            sqlSource.push(now)
            sqlSource.push(userID)

            let sql = 'update tw_task set executor_id=?, state=?, verified_at=?, verified_by=? where '
                + this.genStrCondition('id', task.id)

            let succeed = await this.executeSql(sql, sqlSource);
            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }

    // 删除任务
    async deleteTasks(req, res, next) {
        try {
            let bodyData = await this.extractStringData(req)
            let ids = JSON.parse(bodyData)

            let deletingIds = ''
            for (let i = 0; i < ids.length; ++i) {
                let deletingId = '\'' + ids[i] + '\''
                deletingIds += deletingId
                if (i < ids.length - 1) {
                    deletingIds += ','
                }
            }

            let sql = 'delete from tw_task where id in ( ' + deletingIds + ' )';

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