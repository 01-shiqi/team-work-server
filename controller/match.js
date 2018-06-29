'use strict'

import Base from './base';
import config from 'config-lite';
import logger from '../logger/logger'
var fs = require('fs');


class Match extends Base {

    constructor() {
        super()

        this.getList = this.getList.bind(this);
    }

    async getList(req, res, next) {
        try {
            let sql = 'select id as matchID, home_team as homeTeam, away_team as awayTeam, match_time as matchTime, ROUND(win_rate,2) as winRate, ROUND(draw_rate,2) as drawRate, convert(loss_rate,decimal(14,2)) as lossRate from guess_match order by id';
            let result = await this.queryArray(sql);
            console.log(result);
            this.sendData(res, result);
        }
        catch (error) {
            logger.error(error);
            this.sendData(res, null)
        }
    }
}


export default new Match()