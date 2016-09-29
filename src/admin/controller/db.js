'use strict';

import Base from './base.js';
import _ from 'lodash';
import moment from 'moment';

var xlsx = require('node-xlsx');
var x = require('xlsx');

export default class extends Base {

  async init(http){
    super.init(http);
    this.loan = this.model('loan');
    this.loanStage = this.model('loan_stage');
    let userInfo = await this.session('userInfo');
    this.userId = userInfo.id;
  }

  indexAction(){
    return this.display();
  }

  async resetloanAction(){
    let { userId:user_id } = this;
    await this.loanStage.execute(`delete x.* from think_loan_stage x left join think_loan y on x.loan_id = y.id where y.user_id=${user_id}`);
    await this.loan.execute(`delete from think_loan where user_id=${user_id}`);
    //await this.loan.execute('truncate table think_loan');
    //await this.loanStage.execute('truncate table think_loan_stage');
    return this.json({errno:200});
  }
}
