'use strict'

import Base from './base'
import logger from '../logger/logger'

class runStatus extends Base {

    constructor() {
        super()

        this.sendRunStatus = this.sendRunStatus.bind(this)
    }

    async sendRunStatus(req, res, next) {
        this.sendData(res, { 'version': '0.9', 'status':'normal', 'errorString':'' })
    }
}

export default new runStatus()