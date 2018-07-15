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
        this.approveTrip = this.approveTrip.bind(this)
        this.deleteTrips = this.deleteTrips.bind(this)
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
        basicInfos.tasks = await this.loadTasks(userID, false, false)
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
                whereClause += this.genStrCondition('created_by', userID)
            }
            if (whereClause != '') {
                whereClause = ' where ' + whereClause
            }

            let totalCountSql = 'select count(*) as value from tw_trip ' + whereClause
            let totalCount = await this.queryValue(totalCountSql)

            let startIndex = pageIndex * countPerPage

            let pageCount = Math.ceil(totalCount / countPerPage)

            let sql = 'select l.id, trip_type as tripType, begin_date as beginDate, end_date as endDate, trip_days as tripDays, description, state, u.true_name as creatorName '
            sql += ' from tw_trip l left join tw_user u on (l.created_by = u.id) '

            sql += whereClause
                + ' order by created_at desc '
                + ' limit ' + startIndex + ',' + countPerPage

            let resultData = this.appendUserInfo(req)
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
     * 创建出差申请
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    async createTrip(req, res, next) {
        try {
            let bodyData = await this.extractStringData(req)
            let trip = JSON.parse(bodyData)
            const id = this.uuid()
            const userID = this.getUserID(req)
            var sqlSource = []
            sqlSource.push(id)
            sqlSource.push(trip.tripType)
            sqlSource.push(trip.beginDate)
            sqlSource.push(trip.endDate)
            sqlSource.push(trip.tripDays)
            sqlSource.push(trip.description)
            sqlSource.push('待审核')

            var now = moment().format('YYYY-MM-DD hh:mm:ss')
            sqlSource.push(now)
            sqlSource.push(userID)
            sqlSource.push(now)
            sqlSource.push(userID)

            var sql = 'insert into tw_trip (id, trip_type, begin_date, end_date, trip_days, description, state, created_at, created_by, updated_at, updated_by)' +
                'values(?,?,?,?, ?,?,?,?, ?,?,?)'

            let succeed = await this.executeSql(sql, sqlSource)
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
                this.sendFailed(res, '出差申请已审核，无法修改')
                return
            }

            const userID = this.getUserID(req)
            var sqlSource = []
            sqlSource.push(trip.tripType)
            sqlSource.push(trip.beginDate)
            sqlSource.push(trip.endDate)
            sqlSource.push(trip.tripDays)
            sqlSource.push(trip.description)

            var now = moment().format('YYYY-MM-DD hh:mm:ss')
            sqlSource.push(now)
            sqlSource.push(userID)

            let sql = 'update tw_trip set trip_type=? , begin_date=?, end_date=?, trip_days=?, description=?, updated_at=?, updated_by=? where '
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

            let state = '待批准'
            if(trip.tripDays <= 1.0) {
                state = '已完成'
            }

            sqlSource.push(state)
            let now = moment().format('YYYY-MM-DD hh:mm:ss')
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

            if(trip.state && trip.state == '已完成') {
                this.sendFailed(res, '出差申请已批准')
                return
            }

            const userID = this.getUserID(req)
            let sqlSource = []

            sqlSource.push('已完成')
            let now = moment().format('YYYY-MM-DD hh:mm:ss')
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