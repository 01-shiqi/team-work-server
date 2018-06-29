'use strict'

import Base from './base';
import logger from '../logger/logger'


class Home extends Base {

    constructor() {
        super()

        this.getIndex = this.getIndex.bind(this)

    }

    async getIndex(req, res, next) {
        res.render('index')
    }
}


export default new Home()