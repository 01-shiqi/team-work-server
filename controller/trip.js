'use strict'

import Base from './base'
import logger from '../logger/logger'

import moment from 'moment'


class Trip extends Base {

    constructor() {
        super()

        this.applyForTrip = this.applyForTrip.bind(this)
        this.manageTrips = this.manageTrips.bind(this)
        this.getMyTrips = this.getMyTrips.bind(this)
        this.getTripList = this.getTripList.bind(this)
        this.createTrip = this.createTrip.bind(this)
        this.updateTrip = this.updateTrip.bind(this)
        this.verifyTrip = this.verifyTrip.bind(this)
        this.finishTrip = this.finishTrip.bind(this)
        this.approveTrip = this.approveTrip.bind(this)
        this.deleteTrips = this.deleteTrips.bind(this)

        this.newTrip = this.newTrip.bind(this)
    }

    /**
     * 申请出差
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async applyForTrip(req, res, next) {
        let basicInfos = await this.loadAllBasicInfos()
        const userID = this.getUserID(req)
        basicInfos.tasks = await this.loadTasks(userID, false, false, true)
        res.render('apply-for-trip', this.appendUserInfo(req, basicInfos))
    }

    /**
     * 出差审批
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async manageTrips(req, res, next) {
        await this.getTripList(req, res, next, true)
    }

    /**
     * 获取我的出差记录
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async getMyTrips(req, res, next) {
        await this.getTripList(req, res, next, false)
    }

    /**
     * 获取出差列表
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @param {*} allusers 
     */
    async getTripList(req, res, next, allusers) {

        try {
            let params = await this.extractQueryParams(req)
            let pageIndex = params.pageIndex || 0

            const countPerPage = 12

            let whereClause = ''
            const userID = this.getUserID(req)
            if (userID && !allusers) {
                whereClause += this.genStrCondition('executor_id', userID)
            }
            if (whereClause != '') {
                whereClause = ' where ' + whereClause
            }

            let totalCountSql = 'select count(*) as value from tw_trip ' + whereClause
            let totalCount = await this.queryValue(totalCountSql)

            let startIndex = pageIndex * countPerPage

            let pageCount = Math.ceil(totalCount / countPerPage)

            let sql = 'select t.id, task_id as taskID, model, work_type as workType, work_object as workObject, work_place as workPlace, plan_begin_date as planBeginDate, plan_end_date as planEndDate, plan_trip_days as planTripDays, actual_begin_date as actualBeginDate, actual_end_date as actualEndDate, actual_trip_days as actualTripDays, trip_work as tripWork, state, u.true_name as creatorName '
            sql += ' from tw_trip t left join tw_user u on (t.executor_id = u.id) '

            sql += whereClause
                + ' order by created_at desc '
                + ' limit ' + startIndex + ',' + countPerPage

            let resultData = await this.loadAllBasicInfos()
            resultData.tasks = await this.loadTasks(userID, allusers, true, true)
            resultData.trips = await this.queryArray(sql)
            resultData.pageCount = pageCount
            resultData.pageIndex = pageIndex
            let viewName = allusers ? 'manage-trips' : 'my-trips'
            res.render(viewName, this.appendUserInfo(req, resultData))
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }

    /**
     * 判断是否存在taskID对应的出差申请
     * @param {*} taskID 
     */
    async existTrip(taskID) {
        try {
            let totalCountSql = 'select count(*) as value from tw_trip where ' + this.genStrCondition('task_id', taskID)
            let totalCount = await this.queryValue(totalCountSql)
            return totalCount >= 1
        } catch(error) {
            throw error
        }
    }

    /**
     * 更新出差的执行人信息
     * @param {*} taskID 
     * @param {*} executorID 
     * @param {*} updatedBy 
     */
    async updateTripExecutor(taskID, executorID, updatedBy) {
        try {
            var sqlSource = []
            sqlSource.push(executorID)

            var now = moment().format('YYYY-MM-DD HH:mm:ss')
            sqlSource.push(now)
            sqlSource.push(updatedBy)

            let sql = 'update tw_trip set executor_id=?, updated_at=?, updated_by=? where '
                + this.genStrCondition('task_id', taskID)

            await this.executeSql(sql, sqlSource)
        } catch(error) {
            throw error
        }        
    }


    /**
     * 创建出差申请
     * @param {*} trip 
     * @param {*} creatorID 
     */
    async newTrip(trip, creatorID) {
        try {
            const id = this.uuid()
            var sqlSource = []
            sqlSource.push(id)
            sqlSource.push(trip.taskID)
            sqlSource.push(trip.model)
            sqlSource.push(trip.workType)
            sqlSource.push(trip.workObject)
            sqlSource.push(trip.workPlace)
            sqlSource.push(trip.planBeginDate)
            sqlSource.push(trip.planEndDate)
            sqlSource.push(trip.planTripDays)
            sqlSource.push(trip.state)
            sqlSource.push(trip.executorID)

            var now = moment().format('YYYY-MM-DD HH:mm:ss')
            sqlSource.push(now)
            sqlSource.push(creatorID)
            sqlSource.push(now)
            sqlSource.push(creatorID)

            var sql = 'insert into tw_trip (id, task_id, model, work_type, work_object, work_place, plan_begin_date, plan_end_date, plan_trip_days, state, executor_id, created_at, created_by, updated_at, updated_by) ' +
                ' values(?,?,?,?, ?,?,?,?, ?,?,?,?, ?,?,?)'

            let succeed = await this.executeSql(sql, sqlSource)
            return true
        }
        catch (error) {
            throw error
        }
    }

    /**
     * 创建出差申请
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async createTrip(req, res, next) {
        try {
            let bodyData = await this.extractStringData(req)
            let trip = JSON.parse(bodyData)
            const userID = this.getUserID(req)
            trip.executorID = userID
            trip.state = '待审核'
            await this.newTrip(trip, userID)
            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }

    /**
     * 修改出差申请
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async updateTrip(req, res, next) {

        try {
            let bodyData = await this.extractStringData(req)
            let trip = JSON.parse(bodyData)

            if(trip.state && trip.state != '待审核' && !this.isSuperAdmin(req)) {
                this.sendFailed(res, '出差申请已审核或已批准，无法修改')
                return
            }

            const userID = this.getUserID(req)
            var sqlSource = []
            sqlSource.push(trip.taskID)
            sqlSource.push(trip.workType)
            sqlSource.push(trip.model)
            sqlSource.push(trip.workObject)
            sqlSource.push(trip.workPlace)
            sqlSource.push(trip.planBeginDate)
            sqlSource.push(trip.planEndDate)
            sqlSource.push(trip.planTripDays)

            var now = moment().format('YYYY-MM-DD HH:mm:ss')
            sqlSource.push(now)
            sqlSource.push(userID)

            let sql = 'update tw_trip set task_id=?, work_type=?, model=?, work_object=?, work_place=?, plan_begin_date=?, plan_end_date=?, plan_trip_days=?, updated_at=?, updated_by=? where '
                + this.genStrCondition('id', trip.id)

            await this.executeSql(sql, sqlSource)
            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }



    /**
     * 审核出差申请
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async verifyTrip(req, res, next) {

        try {
            let bodyData = await this.extractStringData(req)
            let trip = JSON.parse(bodyData)

            if(trip.state && trip.state != '待审核') {
                this.sendFailed(res, '出差申请已审核或已批准')
                return
            }

            const userID = this.getUserID(req)
            let sqlSource = []

            sqlSource.push('待批准')
            let now = moment().format('YYYY-MM-DD HH:mm:ss')
            sqlSource.push(now)
            sqlSource.push(userID)

            let sql = 'update tw_trip set state=?, verified_at=?, verified_by=? where '
                + this.genStrCondition('id', trip.id)

            await this.executeSql(sql, sqlSource);
            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }

    /**
     * 批准出差申请
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async approveTrip(req, res, next) {

        try {
            let bodyData = await this.extractStringData(req)
            let trip = JSON.parse(bodyData)

            if(trip.state && trip.state == '已批准') {
                this.sendFailed(res, '出差申请已批准')
                return
            }

            const userID = this.getUserID(req)
            let sqlSource = []

            sqlSource.push('已批准')
            let now = moment().format('YYYY-MM-DD HH:mm:ss')
            sqlSource.push(now)
            sqlSource.push(userID)

            let sql = 'update tw_trip set state=?, approved_at=?, approved_by=? where '
                + this.genStrCondition('id', trip.id)

            await this.executeSql(sql, sqlSource);
            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }


    /**
     * 完成出差申请
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async finishTrip(req, res, next) {

        try {
            let bodyData = await this.extractStringData(req)
            let trip = JSON.parse(bodyData)

            if(trip.state && trip.state != '已批准' && trip.state != '已完成') {
                this.sendFailed(res, '出差申请未批准')
                return
            }

            const userID = this.getUserID(req)
            let sqlSource = []

            sqlSource.push('已完成')
            sqlSource.push(trip.actualBeginDate)
            sqlSource.push(trip.actualEndDate)
            sqlSource.push(trip.actualTripDays)
            sqlSource.push(trip.tripWork)
            let now = moment().format('YYYY-MM-DD HH:mm:ss')
            sqlSource.push(now)
            sqlSource.push(userID)

            let sql = 'update tw_trip set state=?, actual_begin_date=?, actual_end_date=?, actual_trip_days=?, trip_work=?, finished_at=?, finished_by=? where '
                + this.genStrCondition('id', trip.id)

            await this.executeSql(sql, sqlSource);
            await this.updateTaskProgress(trip.taskID, 100)
            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }

    /**
     * 删除出差记录
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async deleteTrips(req, res, next) {
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

            let sql = 'delete from tw_trip where id in ( ' + deletingIds + ' )';

            let succeed = await this.executeSql(sql);
            this.sendSucceed(res)
        }
        catch (error) {
            logger.error(error)
            this.sendFailed(res, error.message)
        }
    }

}


export default new Trip()