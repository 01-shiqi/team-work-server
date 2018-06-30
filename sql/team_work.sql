/*
Navicat MySQL Data Transfer

Source Server         : local
Source Server Version : 50720
Source Host           : localhost:3306
Source Database       : team_work

Target Server Type    : MYSQL
Target Server Version : 50720
File Encoding         : 65001

Date: 2018-06-30 20:46:39
*/

SET FOREIGN_KEY_CHECKS=0;

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
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_login_name` (`login_name`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tw_user
-- ----------------------------
INSERT INTO `tw_user` VALUES ('1', 'lianyz', '连彦泽', 'lianyz', '项目负责人');
INSERT INTO `tw_user` VALUES ('2', 'liangyl', '梁艳龙', 'liangyl', '软件开发工程师');
INSERT INTO `tw_user` VALUES ('3', 'huoxj', '霍晓静', 'huoxj', '软件测试工程师');

-- ----------------------------
-- Table structure for `tw_worklog`
-- ----------------------------
DROP TABLE IF EXISTS `tw_worklog`;
CREATE TABLE `tw_worklog` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `work_date` date DEFAULT NULL,
  `work_begin_time` varchar(50) DEFAULT NULL,
  `work_end_time` varchar(50) DEFAULT NULL,
  `work_type` varchar(50) DEFAULT NULL,
  `model` varchar(50) DEFAULT NULL,
  `work_place` varchar(50) DEFAULT NULL,
  `work_object` varchar(50) DEFAULT NULL,
  `work_content` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tw_worklog
-- ----------------------------
