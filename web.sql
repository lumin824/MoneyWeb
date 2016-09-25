DROP TABLE IF EXISTS `think_user`;
CREATE TABLE `think_user` (
  `id` int(16) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `pid` int(16) unsigned COMMENT '父用户ID',
  `name` char(255) NOT NULL COMMENT '姓名',
  `password` char(255) NOT NULL COMMENT '密码',
  `mobile` char(255) NOT NULL DEFAULT '' COMMENT '用户手机',
  `canLoginAdmin` char(255) NOT NULL DEFAULT 'false' COMMENT '是否可以登录后台',
  PRIMARY KEY (`id`),
  KEY `pid` (`pid`),
  UNIQUE KEY `mobile` (`mobile`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=FIXED;

DROP TABLE IF EXISTS `think_loan`;
CREATE TABLE `think_loan` (
  `id` int(16) unsigned NOT NULL AUTO_INCREMENT COMMENT '贷款ID',
  `mobile` char(255) NOT NULL COMMENT '手机号',
  `idno` char(255) NOT NULL COMMENT '身份证号',
  `name` char(255) NOT NULL COMMENT '姓名',
  `money` char(255) NOT NULL COMMENT '金额',
  `total_stage` char(255) NOT NULL COMMENT '分期',
  `start_time` bigint(20) NOT NULL DEFAULT '0' COMMENT '开始日期',
  `end_time` bigint(20) NOT NULL DEFAULT '0' COMMENT '结束日期',
  `icloud` char(255) NOT NULL DEFAULT '' COMMENT '苹果账号',
  `remark` char(255) COMMENT '备注',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=FIXED;

DROP TABLE IF EXISTS `think_loan_stage`;
CREATE TABLE `think_loan_stage` (
  `id` int(16) unsigned NOT NULL AUTO_INCREMENT COMMENT '贷款分期ID',
  `loan_id` int(16) NOT NULL COMMENT '贷款ID',
  `stage` char(255) NOT NULL COMMENT '当前分期',
  `lixi_1` decimal(8,2) NOT NULL DEFAULT '0.00' COMMENT '应还利息',
  `lixi_2` decimal(8,2) NOT NULL DEFAULT '0.00' COMMENT '已还利息',
  `benjin_1` decimal(8,2) NOT NULL DEFAULT '0.00' COMMENT '应还本金',
  `benjin_2` decimal(8,2) NOT NULL DEFAULT '0.00' COMMENT '已还本金',
  `end_time` bigint(20) NOT NULL COMMENT '最迟还款时间',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=FIXED;
