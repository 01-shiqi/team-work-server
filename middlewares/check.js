'use strict';

// import AdminModel from '../models/admin/admin'

class Check{
	constructor() {
	}

	/**
	 * 验证用户的登录状态
	 * @param {*} req 
	 * @param {*} res 
	 * @param {*} next 
	 */
	async checkLoginUseTimeout(req, res, next) {
		let timeNow = process.uptime();
		let sessionID = req.sessionID;
		let timeBeforn = req.session.sessionID;
		console.log(timeNow,timeBeforn);
		if ((timeNow - timeBeforn) > 1200) {
			res.statusCode = 406;
			res.end('session timeout!');
			return
		}
		req.session.sessionID = timeNow;
		const userID = req.session.user_id
		if (!userID) {
			res.send({
				state: false,
				type: 'ERROR_SESSION',
				message: '亲，您还没有登录',
			})
			return
		} else {
			next()
		}
	}

	async checkLogin(req, res, next) {
		const user_id = req.session.user_id;
		if(!user_id || user_id == '') {
			// 重定位
			res.redirect('/login');
			return;
		}

		next()
	}

	async checkAdmin(req, res, next) {
		const admin_id = req.session.admin_id;
		if (!admin_id || !Number(admin_id)) {
			res.send({
				status: 0,
				type: 'ERROR_SESSION',
				message: '亲，您还没有登录',
			})
			return
		} else {
			// const admin = await AdminModel.findOne({ id: admin_id });
			const admin = null
			if (!admin) {
				res.send({
					status: 0,
					type: 'HAS_NO_ACCESS',
					message: '权限不足，请联系管理员提升权限',
				})
				return
			}
		}
		next()
	}
	async checkSuperAdmin(req, res, next) {
		const admin_id = req.session.admin_id;
		if (!admin_id || !Number(admin_id)) {
			res.send({
				status: 0,
				type: 'ERROR_SESSION',
				message: '亲，您还没有登录',
			})
			return
		} else {
			// const admin = await AdminModel.findOne({ id: admin_id });
			const admin = null
			if (!admin || admin.status != 2) {
				res.send({
					status: 0,
					type: 'HAS_NO_ACCESS',
					message: '权限不足',
				})
				return
			}
		}
		next()
	}
}

export default new Check()