'use strict'

import Base from './base'
import logger from '../logger/logger'

import moment from 'moment'


class Leave extends Base {

    constructor() {
        super()

        this.applyForLeave = this.applyForLeave.bind(this)
        this.getLeaveList = this.getLeaveList.bind(this)
        this.createLeave = this.createLeave.bind(this)
        this.deleteLeaves = this.deleteLeaves.bind(this)
    }

    /**
     * 休假申请
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async applyForLeave(req, res, next) {
        await this.getLeaveList(req, res, next, false)
    }

    /**
     * 获取休假列表
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @param {*} allusers 
     */
    async getLeaveList(req, res, next, allusers) {

        try {
            let params = await this.extractQueryParams(req)
            let pageIndex = params.pageIndex || 0

            const countPerPage = 12

            let whereClause = ''
            const userID = this.getUserID(req)
            if (userID && !allusers) {
                whereClause += this.genStrCondition('created_by', userID)
            }
            if (whereClause != '') {
                whereClause = ' where ' + whereClause
            }

            let totalCountSql = 'select count(*) as value from tw_leave ' + whereClause
            let totalCount = await this.queryValue(totalCountSql)

            let startIndex = pageIndex * countPerPage

            let pageCount = Math.ceil(totalCount / countPerPage)

            let sql = 'select l.id, leave_type as leaveType, begin_date as beginDate, end_date as endDate, leave_days as leaveDays, description, state, u.true_name as creatorName '
            sql += ' from tw_leave l left join tw_user u on (l.created_by = u.id) '

            sql += whereClause
                + ' order by created_at desc '
                + ' limit ' + startIndex + ',' + countPerPage

            let resultData = this.appendUserInfo(req)
            resultData.leaves = await this.queryArray(sql)
            resultData.pageCount = pageCount
            resultData.pageIndex = pageIndex
            let viewName = allusers ? 'manage-leaves' : 'apply-for-leave'
            res.render(viewName, this.appendUserInfo(req, resultData))
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }

    /**
     * 创建休假申请
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async createLeave(req, res, next) {
        try {
            let bodyData = await this.extractStringData(req)
            let leave = JSON.parse(bodyData)
            const id = this.uuid()
            const userID = this.getUserID(req)
            var sqlSource = []
            sqlSource.push(id)
            sqlSource.push(leave.leaveType)
            sqlSource.push(leave.beginDate)
            sqlSource.push(leave.endDate)
            sqlSource.push(leave.leaveDays)
            sqlSource.push(leave.description)

            var now = moment().format('YYYY-MM-DD hh:mm:ss')
            sqlSource.push(now)
            sqlSource.push(userID)
            sqlSource.push(now)
            sqlSource.push(userID)

            var sql = 'insert into tw_leave (id, leave_type, begin_date, end_date, leave_days, description, created_at, created_by, updated_at, updated_by)' +
                'values(?,?,?,?, ?,?,?,?, ?,?)'

            let succeed = await this.executeSql(sql, sqlSource)
            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }


    /**
     * 删除休假记录
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async deleteLeaves(req, res, next) {
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

            let sql = 'delete from tw_leave where id in ( ' + deletingIds + ' )';

            let succeed = await this.executeSql(sql);
            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }

}


export default new Leave()