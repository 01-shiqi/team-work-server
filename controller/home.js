'use strict'

import Base from './base';
import logger from '../logger/logger'


class Home extends Base {

    constructor() {
        super()

        this.getIndex = this.getIndex.bind(this)

    }

    async getIndex(req, res, next) {
        if(req.session.role == 0) {
            res.redirect('/manage-worklogs')
        } else {
            res.redirect('/write-worklog')
        }
        // res.render('index', this.appendUserInfo(req))
    }
}


export default new Home()