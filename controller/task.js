'use strict'

import Base from './base'
import logger from '../logger/logger'
import Trip from './trip'


class Task extends Base {

    constructor() {
        super()

        this.manageTasks = this.manageTasks.bind(this)
        this.getCreateTask = this.getCreateTask.bind(this)
        this.createTask = this.createTask.bind(this)
        this.updateTask = this.updateTask.bind(this)
        this.verifyTask = this.verifyTask.bind(this)
        this.closeTask = this.closeTask.bind(this)
        this.deleteTasks = this.deleteTasks.bind(this)
        this.getMyTasks = this.getMyTasks.bind(this)
        this.getTaskList = this.getTaskList.bind(this)
        this.loadBasicInfo = this.loadBasicInfo.bind(this)
        this.loadAllBasicInfos = this.loadAllBasicInfos.bind(this)
        
        this.createTripByTask = this.createTripByTask.bind(this)
        this.updateTripByTask = this.updateTripByTask.bind(this)
        this.createOrUpdateTripByTask = this.createOrUpdateTripByTask.bind(this)
        this.statisticsTasks = this.statisticsTasks.bind(this)
        this.genWhereClauseByTaskType = this.genWhereClauseByTaskType.bind(this)
    }

    /**
     * 获取创建任务的页面
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getCreateTask(req, res, next) {
        let basicInfos = await this.loadAllBasicInfos()
        res.render('create-task', this.appendUserInfo(req, basicInfos))
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
            sqlSource.push(task.workObject)
            sqlSource.push(task.workPlace)
            sqlSource.push(task.beginTime)
            sqlSource.push(task.endTime)
            sqlSource.push(task.personHours)
            sqlSource.push(task.executor)
            sqlSource.push(task.name)
            sqlSource.push(task.content)
            sqlSource.push('已创建')

            var now = this.now()
            sqlSource.push(now)
            sqlSource.push(userID)
            sqlSource.push(now)
            sqlSource.push(userID)

            var sql = 'insert into tw_task (id, type, model, work_object, work_place, begin_time, end_time, person_hours, executor_id, name, content, state, created_at, created_by, updated_at, updated_by)' +
                'values(?,?,?,?, ?,?, ?,?,?,?, ?,?,?,?, ?,?)'

            let succeed = await this.executeSql(sql, sqlSource)
            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
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

    /**
     * 统计任务情况 已下发、已超期、已完成、已关闭
     * @param {*} whereClause 
     */
    async statisticsTasks(whereClause) {

        try {
            let sql = 'select end_time as endTime, progress, actual_end_time as actualEndTime, state from tw_task ' + whereClause
            let tasks = await this.queryArray(sql)

            let statistics = {
                totalTasksCount: tasks.length,
                createdTasksCount: 0,
                verifiedTasksCount: 0,
                expiredTasksCount: 0,
                finishedTasksCount: 0,
                closedTasksCount: 0
            }

            let now = new Date()
            let today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

            for(let i = 0; i < tasks.length; ++i) {
                let planEndDate = new Date(tasks[i].endTime.replace(/\-/g, "\/"))
                if (tasks[i].state == '已创建') {
                    statistics.createdTasksCount++
                } else if (tasks[i].state == '已关闭') {
                    statistics.finishedTasksCount++
                } else if (tasks[i].progress == 100) {
                    statistics.finishedTasksCount++
                } else if (planEndDate < today) {
                    statistics.expiredTasksCount++
                } else if (tasks[i].state == '已下发') {
                    statistics.verifiedTasksCount++
                }
            }
            return statistics
        }
        catch (error) {
            throw error
        }
    }

    genWhereClauseByTaskType(taskType) {
        let condition = ''
        if(taskType == 'verified') {
            condition = ' state = \'已下发\' and end_time >= \'' + this.today() + '\' '
        } else if (taskType == 'expired') {
            condition = ' state = \'已下发\' and end_time < \'' + this.today() + '\' '
        } else if (taskType == 'finished') {
            condition = ' (state = \'已关闭\' or progress = 100) '
        }
        return condition
    }

    // 获取任务列表
    async getTaskList(req, res, next, allusers) {

        try {
            let params = await this.extractQueryParams(req)
            let pageIndex = params.pageIndex || 0
            let taskType = params.taskType || 'total'

            const countPerPage = 12

            let whereClause = ''
            const userID = this.getUserID(req)
            if (userID && !allusers) {
                whereClause += this.genStrCondition('executor_id', userID)
                whereClause += ' and state != \'' + '已创建' + '\' '
            }
            if (whereClause != '') {
                whereClause = ' where ' + whereClause
            }

            let resultData = await this.loadAllBasicInfos()
            resultData.statistics = await this.statisticsTasks(whereClause)

            // 根据任务类型添加where条件
            let condition = this.genWhereClauseByTaskType(taskType)
            if(condition) {
                if(whereClause == '') {
                    whereClause = ' where '
                } else {
                    whereClause += ' and '
                }
                whereClause += condition
            }

            let totalCountSql = 'select count(*) as value from tw_task ' + whereClause
            let totalCount = await this.queryValue(totalCountSql)

            let startIndex = pageIndex * countPerPage

            let pageCount = Math.ceil(totalCount / countPerPage)

            let sql = 'select tw_task.id, type, name, content, state, model, work_object as workObject, work_place as workPlace, begin_time as beginTime, end_time as endTime, person_hours as personHours, progress, actual_end_time as actualEndTime '
            sql += ', b.true_name as executorName, b.id as executorID '
            sql += ', c.true_name as creatorName '

            sql += ' from tw_task left join tw_user b on (tw_task.executor_id = b.id) '
            sql += ' left join tw_user c on (tw_task.created_by = c.id) '

            sql += whereClause
                + ' order by created_at desc '
                + ' limit ' + startIndex + ',' + countPerPage

            resultData.tasks = await this.queryArray(sql)

            resultData.pageCount = pageCount
            resultData.pageIndex = pageIndex
            resultData.queryParam = 'taskType=' + taskType
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

            // if(task.state != '已创建' && !this.isSuperAdmin(req)) {
            //     this.sendFailed(res, '任务已下发，无法修改')
            //     return
            // }

            const id = this.uuid()
            const userID = this.getUserID(req)
            var sqlSource = []
            sqlSource.push(task.type)
            sqlSource.push(task.model)
            sqlSource.push(task.workObject)
            sqlSource.push(task.workPlace)
            sqlSource.push(task.beginTime)
            sqlSource.push(task.endTime)
            sqlSource.push(task.personHours)
            sqlSource.push(task.executor)
            sqlSource.push(task.name)
            sqlSource.push(task.content)

            var now = this.now()
            sqlSource.push(now)
            sqlSource.push(userID)

            let sql = 'update tw_task set type=? , model=?, work_object=?, work_place=?, begin_time=?, end_time=?, person_hours=?, executor_id=?, name=?, content=?, updated_at=?, updated_by=? where '
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
            const userID = this.getUserID(req)
            var sqlSource = []
            sqlSource.push(task.executor)
            sqlSource.push('已下发')

            var now = this.now()
            sqlSource.push(now)
            sqlSource.push(userID)

            let sql = 'update tw_task set executor_id=?, state=?, verified_at=?, verified_by=? where '
                + this.genStrCondition('id', task.id)

            await this.executeSql(sql, sqlSource)
            await this.createOrUpdateTripByTask(task, userID)

            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }

    /**
     * 根据任务创建出差申请或更新出差的执行人
     * @param {*} task 
     * @param {*} userID 
     */
    async createOrUpdateTripByTask(task, userID) {
        if(await Trip.existTrip(task.id)) {
            await this.updateTripByTask(task, userID)
        } else {
            await this.createTripByTask(task, userID)
        }
    }

    /**
     * 根据任务创建出差申请
     * @param {*} task 
     * @param {*} userID 
     */
    async createTripByTask(task, userID) {
        if(task.type != '出差') {
            return
        }
        let trip = {}
        trip.taskID = task.id
        trip.model = task.model
        trip.workTimes = task.type
        trip.workObject = task.workObject
        trip.workPlace = task.workPlace
        trip.planBeginDate = task.beginTime
        trip.planEndDate = task.endTime
        trip.planTripDays = this.calcDays(trip.planBeginDate, trip.planEndDate)
        trip.state = '待批准'
        trip.executorID = task.executor
        await Trip.newTrip(trip, userID)
    }

    /**
     * 根据任务更新出差的执行人
     * @param {*} task 
     * @param {*} userID 
     */
    async updateTripByTask(task, userID) {
        await Trip.updateTripExecutor(task.id, task.executor, userID)
    }
    
    /**
     * 关闭任务
     */
    async closeTask(req, res, next) {

        try {
            let bodyData = await this.extractStringData(req)
            let task = JSON.parse(bodyData)
            const userID = this.getUserID(req)
            var sqlSource = []
            sqlSource.push('已关闭')

            var now = this.now()
            sqlSource.push(now)
            sqlSource.push(userID)

            let sql = 'update tw_task set state=?, closed_at=?, closed_by=? where '
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