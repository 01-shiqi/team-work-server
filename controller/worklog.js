'use strict'

import Base from './base'
import logger from '../logger/logger'

import moment from 'moment'


class Worklog extends Base {

    constructor() {
        super()

        this.writeWorklog = this.writeWorklog.bind(this)
        this.manageWorklogs = this.manageWorklogs.bind(this)
        this.getMyWorklogs = this.getMyWorklogs.bind(this)
        this.getWorklogList = this.getWorklogList.bind(this)
        this.commitWorklog = this.commitWorklog.bind(this)
        this.updateWorklog = this.updateWorklog.bind(this)
        this.deleteWorklogs = this.deleteWorklogs.bind(this)
        this.loadBasicInfo = this.loadBasicInfo.bind(this)
        this.loadAllBasicInfos = this.loadAllBasicInfos.bind(this)
        this.loadMyTasks = this.loadMyTasks.bind(this)
    }

    async writeWorklog(req, res, next) {
        let basicInfos = await this.loadAllBasicInfos(req)
        res.render('write-worklog', this.appendUserInfo(req, basicInfos))
    }

    /**
     * 加载我的任务信息
     */
    async loadMyTasks(userID) {
        try {
            var sql = 'select id, `name`, model, type as type, work_object as workObject, work_place as workPlace from tw_task where state != \'已创建\' and progress != 100 and ' + this.genStrCondition('executor_id', userID) +  ' order by `name`'
            var tasks = await this.queryArray(sql)
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

    async loadAllBasicInfos(req) {

        let basicInfos = {}

        basicInfos.workTimes = await this.loadBasicInfo('tw_work_time')
        basicInfos.workTypes = await this.loadBasicInfo('tw_work_type')
        basicInfos.models = await this.loadBasicInfo('tw_model')
        basicInfos.workPlaces = await this.loadBasicInfo('tw_work_place')
        basicInfos.workObjects = await this.loadBasicInfo('tw_work_object')

        const userID = this.getUserID(req)
        basicInfos.tasks = await this.loadMyTasks(userID)

        return basicInfos
    }

    // 获取管理日志列表
    async manageWorklogs(req, res, next) {
        await this.getWorklogList(req, res, next, true)
    }
  
    // 获取我的日志列表
    async getMyWorklogs(req, res, next) {  
        await this.getWorklogList(req, res, next, false)
    }

    // 获取日志列表
    async getWorklogList(req, res, next, allusers) {

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

            let totalCountSql = 'select count(*) as value from tw_worklog ' + whereClause
            let totalCount = await this.queryValue(totalCountSql)

            let startIndex = pageIndex * countPerPage

            let pageCount = Math.ceil(totalCount / countPerPage)

            let sql = 'select tw_worklog.id, work_date as workDate, work_begin_time as workBeginTime, work_time_length as workTimeLength, work_type as workType, model, work_place as workPlace, work_object as workObject, work_content as workContent, task_id as taskID'
            
            if(allusers) {
                sql += ', tw_user.true_name as trueName from tw_worklog left join tw_user on tw_worklog.user_id = tw_user.id '
            } else {
                sql += ', null as trueName from tw_worklog '
            }

            sql += whereClause 
                + ' order by workDate desc, trueName, workBeginTime '
                + ' limit ' + startIndex + ',' + countPerPage

            let resultData = await this.loadAllBasicInfos(req)
            resultData.worklogs = await this.queryArray(sql)
            resultData.pageCount = pageCount
            resultData.pageIndex = pageIndex
            let viewName = allusers ? 'manage-worklogs' : 'my-worklogs'
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
            sqlSource.push(worklog.taskID)

            var now = moment().format('YYYY-MM-DD hh:mm:ss')
            sqlSource.push(now)
            sqlSource.push(now)

            var sql = 'insert into tw_worklog (id, user_id, work_date, work_begin_time, work_time_length, work_type, model, work_place, work_object, work_content, task_id, created_at, updated_at) ' + 
                      'values(?,?,?,?,?,?,?,?,?,?,?,?,?)'

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

            let sql = 'update tw_worklog set work_date=? , work_begin_time=?, work_time_length=?, work_type=?, model=?, work_place=?, work_object=?, work_content=?, task_id=?, updated_at=? where ' 
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


export default new Worklog()