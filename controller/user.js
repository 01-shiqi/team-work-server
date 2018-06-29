'use strict'

import formidable from 'formidable'
import dtime from 'time-formater'
import xml2js from 'xml2js'
import fs from 'fs'
import url from 'url'

var DATABASE = 'dataip';
var MODELTABLE = 'A_Model';
var TASKTABLE = 'A_Task';
var success = { state: 'true' };
var failed = { state: 'false' };
const EXT_EXPECTED_CURVE = "expectedCurves";
const EXT_ENVELOPE_CURVE = "envelopeCurves";



import Base from './base'


class User extends Base {

    constructor() {
        super()

        this.login = this.login.bind(this)
        this.loadUser = this.loadUser.bind(this)
        this.keyLogin = this.keyLogin.bind(this)
    }

    async login(req, res, next) {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.send({
                    status: 0,
                    type: 'FORM_DATA_ERROR',
                    message: '表单信息错误'
                })
                return
            }
            const { user_name, password, isThirdPartyLogin, status = 1 } = fields;
            var user = {};

            let sessionID = req.sessionID;
            let time = process.uptime();
            req.session.sessionID = time;

            req.session.userID = user_name;
            if (isThirdPartyLogin == 'true') {
                res.send("");
                return;
            }
            this.loadUser(user_name, password, function (user) {
                console.dir(user);
                console.log(JSON.stringify(user))
                res.send(user);
            });
        })
    }


    async keyLogin(req, res, next) {
        var user = {
            result: {},
            userInfo: {},
            rights: {}
        };
        user.result["successd"] = 'false';
        user.result["message"] = '用户名或密码错误';
        user.result["errorType"] = '用户名或密码错误';
        console.log(user);
        this.sendData(res, user);
    }

    loadUser(username, password, func) {
        fs.readFile(__dirname + '/../login.xml', 'utf-8', function (err, result) {
            var user = {
                result: {},
                userInfo: {},
                rights: {}
            };
            var data = {};
            var datas = [];
            var rightName = [];
            var systems = [];
            var roleID = [];
            user.result["successd"] = 'false';
            user.result["message"] = "用户名或密码错误";
            if (err) {
                throw err;
            }
            xml2js.parseString(result, { explicitArray: false }, function (err, json) {
                if (err) {
                    throw err;
                }
                var jsonXml = json;
                var users = jsonXml['Table']['Users']['User'];
                for (var index = 0; index < users.length; index++) {
                    var element = users[index];
                    if (element['$']['name'] == username && element['$'].password == password) {
                        user.result["successd"] = 'true';
                        user.result["message"] = '登陆成功';
                        user.userInfo.name = element['$'].name;
                        user.userInfo.truename = element['$'].truename;
                        user.userInfo.desc = element['$'].desc;
                        user.userInfo.unit = element['$'].unit;
                        user.userInfo.admin = 'false';

                        var idRoles = element['role'];
                        console.log(idRoles instanceof Array);
                        if (idRoles instanceof Array) {
                            for (var number = 0; number < idRoles.length; number++) {
                                var roleElement = idRoles[number];
                                roleID[number] = roleElement['$'].id;
                                if (roleElement['$'].id == "000") {
                                    user.userInfo.admin = 'true';
                                    return func(user);
                                }
                            }
                        } else {
                            console.log('@@@@@@@@@@@@@@@');
                            if (idRoles['$'].id == "000") {
                                user.userInfo.admin = 'true';
                                return func(user);
                            }
                        }
                    }
                }
                var roles = jsonXml['Table']['Roles']['Role'];
                console.log(roleID.length);
                for (var i = 0; i < roleID.length; i++) {
                    var ID = roleID[i];
                    for (var n = 0; n < roles.length; n++) {
                        var roleElement = roles[n];
                        //     		console.log(roleElement['$']['id']);
                        if (roleElement['$']['id'] == ID) {
                            var roleRights = roleElement['right'];
                            if (roleRights instanceof Array) {
                                for (var m = 0; m < roleRights.length; m++) {
                                    rightName[m] = roleRights[m]['$']['name'];
                                    if (roleRights[m]['$']['name'] == "数据浏览") {
                                        var model = roleRights[m]['model'];
                                        if (model instanceof Array) {
                                            for (var j = 0; j < model.length; j++) {

                                            }
                                        }
                                        else {
                                            data.modelName = model['$']['mame'];
                                            data.modelID = 0;
                                            var tempSystem = model['system'];

                                            var systemName = [];
                                            for (var s = 0; s < tempSystem.length; s++) {
                                                systemName[s] = tempSystem[s]['$']['name'];
                                            }
                                            console.log('****************');
                                            console.log(systemName);
                                            data.systems = systemName;

                                        }
                                    }
                                }
                                datas.push(data);
                            }

                        }
                    }
                }
                user.rights.data = datas;
                user.rights.function = rightName;
                func(user);
                console.log(user);
            });
        });
    }
}



export default new User()