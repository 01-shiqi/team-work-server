/*
Navicat MySQL Data Transfer

Source Server         : local
Source Server Version : 50720
Source Host           : localhost:3306
Source Database       : team_work

Target Server Type    : MYSQL
Target Server Version : 50720
File Encoding         : 65001

Date: 2018-06-30 10:53:03
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
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_login_name` (`login_name`) USING HASH
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of tw_user
-- ----------------------------
INSERT INTO `tw_user` VALUES ('1', 'lianyz', '连彦泽', 'lianyz');
INSERT INTO `tw_user` VALUES ('2', 'liangyl', '梁艳龙', 'liangyl');

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
INSERT INTO `tw_worklog` VALUES ('1', '', '2018-05-12', '', '', '', '', '', '', '', '2018-05-12 01:00:00', '2018-05-12 01:00:00');
INSERT INTO `tw_worklog` VALUES ('13cd429e-dec7-4823-b2f7-7aab9170ec88', '1', '2018-06-30', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', 'aaaa', '2018-06-30 10:52:02', '2018-06-30 10:52:13');
INSERT INTO `tw_worklog` VALUES ('19d08e06-5ad1-49d1-a6b4-3fa17243b003', null, '2018-06-29', '09:30', '10:00', '软件开发', 'CZ-2C', '仿真楼', '实时数据处理软件', '完成软件的安装与部署、重新安装与部署', '2018-06-29 09:29:51', '2018-06-30 07:08:36');
INSERT INTO `tw_worklog` VALUES ('2', '', '2018-05-12', '', '', '', '', '', '', '', '2018-05-12 00:00:00', '2018-05-12 01:00:00');
INSERT INTO `tw_worklog` VALUES ('243dde59-9f0f-405f-acab-3546df3255f8', '1', '2018-06-30', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-30 10:52:06', '2018-06-30 10:52:06');
INSERT INTO `tw_worklog` VALUES ('4212b36a-6eca-4aaa-99a2-c4c99deefc0b', null, '2018-06-28', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-28 02:36:15', '2018-06-28 02:36:15');
INSERT INTO `tw_worklog` VALUES ('4bf41269-4f3d-4431-98db-afed1541eda2', null, '2018-05-20', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-27 11:26:07', '2018-06-27 11:26:07');
INSERT INTO `tw_worklog` VALUES ('5ec6469c-1ff7-47e4-b4a8-54731b05044b', null, '2018-06-29', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-29 12:36:51', '2018-06-29 12:36:51');
INSERT INTO `tw_worklog` VALUES ('72cb8994-36c3-4c0e-9634-f92c3d2146fc', null, '2018-06-29', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '日志管理系统', '完成日志管理系统软件的开发', '2018-06-29 09:19:40', '2018-06-29 09:19:40');
INSERT INTO `tw_worklog` VALUES ('80e21e77-7c73-4aa8-9827-2ec4d12935bc', null, '2018-06-29', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-28 02:36:20', '2018-06-28 02:36:20');
INSERT INTO `tw_worklog` VALUES ('89b5e689-2d56-43c2-bb7b-d2695683d1c6', null, '2018-06-27', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-28 12:00:55', '2018-06-28 12:00:55');
INSERT INTO `tw_worklog` VALUES ('8b489ad8-8e02-41db-96f9-e665d09f6aae', null, '2018-06-30', '08:30', '09:30', '软件开发', 'CZ-2C', '仿真楼', '', '完成了日志管理功能，包括增、删、改、查', '2018-06-30 12:49:13', '2018-06-30 12:49:57');
INSERT INTO `tw_worklog` VALUES ('982d93a2-c7b6-41ce-b193-5615c7adcc5b', null, '2018-05-20', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-27 11:59:55', '2018-06-27 11:59:55');
INSERT INTO `tw_worklog` VALUES ('9a9f56d1-aea0-4cb9-813a-a6a32afa17ef', null, '2018-06-29', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-28 12:01:00', '2018-06-28 12:01:00');
INSERT INTO `tw_worklog` VALUES ('9ae0a9bc-006c-4003-bd52-bb861160eda2', null, '2018-05-20', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-27 11:28:43', '2018-06-27 11:28:43');
INSERT INTO `tw_worklog` VALUES ('a32fddf9-f33e-47f9-952f-70ef7422fb4e', null, '2018-06-28', '09:00', '10:00', '系统试验', 'CZ-2C', '仿真楼', '', '', '2018-06-30 08:15:50', '2018-06-30 08:15:50');
INSERT INTO `tw_worklog` VALUES ('bd999089-fc21-4bc9-b6a4-8a628cfe4985', null, '2018-05-20', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-27 11:28:37', '2018-06-27 11:28:37');
INSERT INTO `tw_worklog` VALUES ('bf903f66-18e9-453d-acc9-076bb4a1c587', null, '2018-06-29', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-29 08:43:25', '2018-06-29 08:43:25');
INSERT INTO `tw_worklog` VALUES ('c3c9c4c1-f2d9-4f87-a30e-10a82e41f3cd', null, '2018-07-01', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-30 08:16:09', '2018-06-30 08:16:09');
INSERT INTO `tw_worklog` VALUES ('d1a72e94-5d93-4b9d-9114-5ef0b616d898', null, '2018-06-29', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-29 08:43:23', '2018-06-29 08:43:23');
INSERT INTO `tw_worklog` VALUES ('dffafc76-7860-4235-9d54-d6c0538b816d', null, '2018-05-20', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-27 11:26:05', '2018-06-27 11:26:05');
INSERT INTO `tw_worklog` VALUES ('e495f1a3-eebe-4872-ac7e-5aefcfe91d27', null, '2018-06-29', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '实时数据处理软件', '完成软件的开发，网络数据发送，完成软件的开发，网络数据发送，\n完成软件的开发，网络数据发送，完成软件的开发，网络数据发送，完成软件的开发，网络数据发送，完成软件的开发，网络数据发送，完成软件的开发，网络数据发送，\n完成软件的开发，网络数据发送，\n完成软件的开发，网络数据发送，', '2018-06-29 09:31:57', '2018-06-29 09:31:57');
INSERT INTO `tw_worklog` VALUES ('f47f5646-f8f8-4a54-9774-5c597e975eae', null, '2018-06-30', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-30 12:49:08', '2018-06-30 12:49:08');
INSERT INTO `tw_worklog` VALUES ('fb8b6a47-b4fb-4da8-ab93-891b16f96b28', null, '2018-05-20', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-27 11:26:02', '2018-06-27 11:26:02');
INSERT INTO `tw_worklog` VALUES ('fbea54ed-a9f7-4762-9a1e-8471d401b376', null, '2018-06-28', '08:30', '08:30', '软件开发', 'CZ-2C', '仿真楼', '', '', '2018-06-28 01:20:13', '2018-06-28 01:20:13');
