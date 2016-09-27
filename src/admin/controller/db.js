'use strict';

import Base from './base.js';
import _ from 'lodash';
import moment from 'moment';

var xlsx = require('node-xlsx');
var x = require('xlsx');

export default class extends Base {

  init(http){
    super.init(http);
    this.loan = this.model('loan');
    this.loanStage = this.model('loan_stage');
  }

  indexAction(){
    return this.display();
  }

  async resetloanAction(){

    await this.loan.execute('truncate table think_loan');
    await this.loanStage.execute('truncate table think_loan_stage');
    return this.json({errno:200});
  }
}
