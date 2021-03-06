/*
Navicat MySQL Data Transfer

Source Server         : local
Source Server Version : 50720
Source Host           : localhost:3306
Source Database       : team_work

Target Server Type    : MYSQL
Target Server Version : 50720
File Encoding         : 65001

Date: 2018-07-17 21:08:13
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `tw_leave`
-- ----------------------------
DROP TABLE IF EXISTS `tw_leave`;
CREATE TABLE `tw_leave` (
  `id` char(36) NOT NULL,
  `leave_type` varchar(50) DEFAULT NULL,
  `begin_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `leave_days` float(50,1) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `verified_by` char(36) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approved_by` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tw_leave
-- ----------------------------

-- ----------------------------
-- Table structure for `tw_model`
-- ----------------------------
DROP TABLE IF EXISTS `tw_model`;
CREATE TABLE `tw_model` (
  `id` char(36) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tw_model
-- ----------------------------
INSERT INTO `tw_model` VALUES ('1', 'CZ-2C', '1');
INSERT INTO `tw_model` VALUES ('2', 'CZ-3A', '2');
INSERT INTO `tw_model` VALUES ('3', 'CZ-5', '3');
INSERT INTO `tw_model` VALUES ('4', 'CZ-5B', '4');
INSERT INTO `tw_model` VALUES ('5', 'CZ-7', '5');
INSERT INTO `tw_model` VALUES ('6', 'CZ-8', '6');
INSERT INTO `tw_model` VALUES ('7', 'CZ-11', '7');

-- ----------------------------
-- Table structure for `tw_task`
-- ----------------------------
DROP TABLE IF EXISTS `tw_task`;
CREATE TABLE `tw_task` (
  `id` char(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `work_object` varchar(50) NOT NULL,
  `work_place` varchar(50) NOT NULL,
  `begin_time` date NOT NULL,
  `end_time` date NOT NULL,
  `person_hours` float NOT NULL,
  `progress` int(11) NOT NULL DEFAULT '0',
  `actual_end_time` date DEFAULT NULL,
  `executor_id` char(36) DEFAULT NULL,
  `name` varchar(50) DEFAULT NULL,
  `content` varchar(500) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `verified_by` char(36) DEFAULT NULL,
  `closed_at` datetime DEFAULT NULL,
  `closed_by` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_id` (`executor_id`),
  KEY `fk_created_by` (`created_by`),
  KEY `fk_updated_by` (`updated_by`),
  CONSTRAINT `fk_created_by` FOREIGN KEY (`created_by`) REFERENCES `tw_user` (`id`) ON DELETE SET NULL ON UPDATE SET NULL,
  CONSTRAINT `fk_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `tw_user` (`id`) ON DELETE SET NULL ON UPDATE SET NULL,
  CONSTRAINT `fk_user_id` FOREIGN KEY (`executor_id`) REFERENCES `tw_user` (`id`) ON DELETE SET NULL ON UPDATE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tw_task
-- ----------------------------

-- ----------------------------
-- Table structure for `tw_trip`
-- ----------------------------
DROP TABLE IF EXISTS `tw_trip`;
CREATE TABLE `tw_trip` (
  `id` char(36) NOT NULL,
  `task_id` char(36) DEFAULT NULL,
  `work_type` varchar(50) DEFAULT NULL,
  `model` varchar(50) DEFAULT NULL,
  `work_object` varchar(50) DEFAULT NULL,
  `work_place` varchar(50) DEFAULT NULL,
  `plan_begin_date` date DEFAULT NULL,
  `plan_end_date` date DEFAULT NULL,
  `plan_trip_days` int(50) DEFAULT NULL,
  `actual_begin_date` date DEFAULT NULL,
  `actual_end_date` date DEFAULT NULL,
  `actual_trip_days` int(50) DEFAULT NULL,
  `trip_work` varchar(500) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `created_by` char(36) DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `updated_by` char(36) DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `verified_by` char(36) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `approved_by` char(36) DEFAULT NULL,
  `finished_at` datetime DEFAULT NULL,
  `finished_by` char(36) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tw_trip
-- ----------------------------

-- ----------------------------
-- Table structure for `tw_user`
-- ----------------------------
DROP TABLE IF EXISTS `tw_user`;
CREATE TABLE `tw_user` (
  `id` char(36) NOT NULL,
  `login_name` varchar(255) NOT NULL,
  `true_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `job_position` varchar(255) DEFAULT NULL,
  `role` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tw_user
-- ----------------------------
INSERT INTO `tw_user` VALUES ('1', 'lianyz', '连彦泽', 'lianyz', '项目负责人', '0');
INSERT INTO `tw_user` VALUES ('2', 'liangyl', '梁艳龙', 'liangyl', '软件开发工程师', '10');
INSERT INTO `tw_user` VALUES ('3', 'huoxj', '霍晓静', 'huoxj', '软件测试工程师', '10');
INSERT INTO `tw_user` VALUES ('4', 'zhaol', '赵雷', 'zhaol', '项目负责人', '1');
INSERT INTO `tw_user` VALUES ('5', 'lizhg', '李志刚', 'lizhg', '软件开发工程师', '10');
INSERT INTO `tw_user` VALUES ('6', 'yantg', '颜廷贵', 'yantg', '总负责人', '-1');

-- ----------------------------
-- Table structure for `tw_worklog`
-- ----------------------------
DROP TABLE IF EXISTS `tw_worklog`;
CREATE TABLE `tw_worklog` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `work_date` date DEFAULT NULL,
  `work_begin_time` varchar(50) DEFAULT NULL,
  `work_time_length` float(50,1) DEFAULT NULL,
  `task_id` char(36) DEFAULT NULL,
  `work_type` varchar(50) DEFAULT NULL,
  `model` varchar(50) DEFAULT NULL,
  `work_object` varchar(50) DEFAULT NULL,
  `work_place` varchar(50) DEFAULT NULL,
  `work_content` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tw_worklog
-- ----------------------------

-- ----------------------------
-- Table structure for `tw_work_object`
-- ----------------------------
DROP TABLE IF EXISTS `tw_work_object`;
CREATE TABLE `tw_work_object` (
  `id` char(36) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tw_work_object
-- ----------------------------
INSERT INTO `tw_work_object` VALUES ('1', '实时数据处理系统', '1');
INSERT INTO `tw_work_object` VALUES ('2', '跨平台实时数据处理系统', '2');
INSERT INTO `tw_work_object` VALUES ('3', 'XX准备系统', '3');
INSERT INTO `tw_work_object` VALUES ('4', '远程自动判读系统', '4');

-- ----------------------------
-- Table structure for `tw_work_place`
-- ----------------------------
DROP TABLE IF EXISTS `tw_work_place`;
CREATE TABLE `tw_work_place` (
  `id` char(36) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tw_work_place
-- ----------------------------
INSERT INTO `tw_work_place` VALUES ('1', '仿真楼', '1');
INSERT INTO `tw_work_place` VALUES ('2', '七车间', '2');
INSERT INTO `tw_work_place` VALUES ('3', '天津', '3');
INSERT INTO `tw_work_place` VALUES ('4', '和兴', '4');

-- ----------------------------
-- Table structure for `tw_work_time`
-- ----------------------------
DROP TABLE IF EXISTS `tw_work_time`;
CREATE TABLE `tw_work_time` (
  `id` char(36) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tw_work_time
-- ----------------------------
INSERT INTO `tw_work_time` VALUES ('1', '08:30', '1');
INSERT INTO `tw_work_time` VALUES ('10', '13:00', '10');
INSERT INTO `tw_work_time` VALUES ('11', '13:30', '11');
INSERT INTO `tw_work_time` VALUES ('12', '14:00', '12');
INSERT INTO `tw_work_time` VALUES ('13', '14:30', '13');
INSERT INTO `tw_work_time` VALUES ('14', '15:00', '14');
INSERT INTO `tw_work_time` VALUES ('15', '15:30', '15');
INSERT INTO `tw_work_time` VALUES ('16', '16:00', '16');
INSERT INTO `tw_work_time` VALUES ('17', '16:30', '17');
INSERT INTO `tw_work_time` VALUES ('18', '17:00', '18');
INSERT INTO `tw_work_time` VALUES ('19', '17:30', '19');
INSERT INTO `tw_work_time` VALUES ('2', '09:00', '2');
INSERT INTO `tw_work_time` VALUES ('20', '18:00', '20');
INSERT INTO `tw_work_time` VALUES ('21', '18:30', '21');
INSERT INTO `tw_work_time` VALUES ('22', '19:00', '22');
INSERT INTO `tw_work_time` VALUES ('23', '19:30', '23');
INSERT INTO `tw_work_time` VALUES ('24', '20:00', '24');
INSERT INTO `tw_work_time` VALUES ('25', '20:30', '25');
INSERT INTO `tw_work_time` VALUES ('26', '21:00', '26');
INSERT INTO `tw_work_time` VALUES ('27', '21:30', '27');
INSERT INTO `tw_work_time` VALUES ('28', '22:00', '28');
INSERT INTO `tw_work_time` VALUES ('29', '22:30', '29');
INSERT INTO `tw_work_time` VALUES ('3', '09:30', '3');
INSERT INTO `tw_work_time` VALUES ('30', '23:00', '30');
INSERT INTO `tw_work_time` VALUES ('4', '10:00', '4');
INSERT INTO `tw_work_time` VALUES ('5', '10:30', '5');
INSERT INTO `tw_work_time` VALUES ('6', '11:00', '6');
INSERT INTO `tw_work_time` VALUES ('7', '11:30', '7');
INSERT INTO `tw_work_time` VALUES ('8', '12:00', '8');
INSERT INTO `tw_work_time` VALUES ('9', '12:30', '9');

-- ----------------------------
-- Table structure for `tw_work_type`
-- ----------------------------
DROP TABLE IF EXISTS `tw_work_type`;
CREATE TABLE `tw_work_type` (
  `id` char(36) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `order` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tw_work_type
-- ----------------------------
INSERT INTO `tw_work_type` VALUES ('1', '软件开发', '1');
INSERT INTO `tw_work_type` VALUES ('2', '文档编写', '2');
INSERT INTO `tw_work_type` VALUES ('3', '运行维护', '3');
INSERT INTO `tw_work_type` VALUES ('4', '系统试验', '4');
INSERT INTO `tw_work_type` VALUES ('5', '出差', '5');
INSERT INTO `tw_work_type` VALUES ('6', '请假换休', '6');
