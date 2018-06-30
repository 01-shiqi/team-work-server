'use strict'

import Base from './base'
import logger from '../logger/logger'

import moment from 'moment'


class Worklog extends Base {

    constructor() {
        super()

        this.writeWorklog = this.writeWorklog.bind(this)
        this.getMyWorklogs = this.getMyWorklogs.bind(this)
        this.commitWorklog = this.commitWorklog.bind(this)
        this.updateWorklog = this.updateWorklog.bind(this)
        this.deleteWorklogs = this.deleteWorklogs.bind(this)
    }

    async writeWorklog(req, res, next) {
        
        res.render('write-worklog')
    }

    // 获取日志列表
    async getMyWorklogs(req, res, next) {

        try {
            let params = await this.extractQueryParams(req)
            let pageIndex = params.pageIndex || 0

            const countPerPage = 10;

            let whereClause = '';
            const userID = this.getUserID(req)
            if(userID){
                whereClause += this.genStrCondition('user_id', userID);
            }
            if(whereClause != '') {
                whereClause = ' where ' + whereClause
            }

            let totalCountSql = 'select count(*) as value from tw_worklog ' + whereClause
            let totalCount = await this.queryValue(totalCountSql)

            let startIndex = pageIndex * countPerPage

            let pageCount = Math.ceil(totalCount / countPerPage)

            var sql = 'select id, work_date as workDate, work_begin_time as workBeginTime, work_end_time as workEndTime, work_type as workType, model, work_place as workPlace, work_object as workObject, work_content as workContent from tw_worklog ' 
                    + whereClause 
                    + ' order by workDate desc, workBeginTime '
                    + ' limit ' + startIndex + ',' + countPerPage

            var worklogs = await this.queryArray(sql)
            res.render('my-worklogs', { worklogs: worklogs, pageCount: pageCount, pageIndex:  pageIndex })
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
            sqlSource.push(worklog.workEndTime)
            sqlSource.push(worklog.workType)
            sqlSource.push(worklog.model)
            sqlSource.push(worklog.workPlace)
            sqlSource.push(worklog.workObject)
            sqlSource.push(worklog.workContent)

            var now = moment().format('YYYY-MM-DD hh:mm:ss')
            sqlSource.push(now)
            sqlSource.push(now)

            var sql = 'insert into tw_worklog (id, user_id, work_date, work_begin_time, work_end_time, work_type, model, work_place, work_object, work_content, created_at, updated_at) ' + 
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

            let sql = 'update tw_worklog set work_date=? , work_begin_time=?, work_end_time=?, work_type=?, model=?, work_place=?, work_object=?, work_content=?, updated_at=? where ' 
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