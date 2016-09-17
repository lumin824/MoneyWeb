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
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=FIXED

CREATE TABLE `think_loan` (
  `id` int(16) unsigned NOT NULL AUTO_INCREMENT COMMENT '贷款ID',
  `mobile` char(255) NOT NULL COMMENT '手机号',
  `idno` char(255) NOT NULL COMMENT '身份证号',
  `name` char(255) NOT NULL COMMENT '姓名',
  `money` char(255) NOT NULL COMMENT '金额',
  `stage` char(255) NOT NULL COMMENT '分期',
  `startDate` char(255) NOT NULL COMMENT '开始日期',
  `endDate` char(255) NOT NULL COMMENT '结束日期',
  `icloud` char(255) NOT NULL DEFAULT '' COMMENT '苹果账号',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=FIXED

CREATE TABLE `think_loan_stage` (
  `id` int(16) unsigned NOT NULL AUTO_INCREMENT COMMENT '贷款分期ID',
  `loanId` int(16) NOT NULL COMMENT '贷款ID',
  `stage` char(255) NOT NULL COMMENT '当前分期',
  `glf` char(255) NOT NULL COMMENT '管理费',
  `bj` char(255) NOT NULL COMMENT '本金',
  `lx` char(255) NOT NULL COMMENT '利息',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 ROW_FORMAT=FIXED
