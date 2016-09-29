'use strict';

import Base from './base.js';

import moment from 'moment';
import _ from 'lodash';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  async qianfeiAction(){
    let { id: user_id } = this.param();
    let now = moment();
    now.hour(0);
    now.minute(0);
    now.second(0);
    now.millisecond(0);
    now = now.unix();
    let list = await this.model('loan_stage')
    .field('a.*,b.mobile,b.name,b.icloud,b.money')
    .alias('a')
    .join({
      table:'loan',
      as:'b',
      join:'left',
      on:['loan_id','id']
    //}).where(`(a.benjin_1 > a.benjin_2 or a.lixi_1 > a.lixi_2) and a.end_time < ${now}`).order('a.end_time asc').select();
    }).where({'a.benjin_1':['exp', '>a.benjin_2 or a.lixi_1>a.lixi_2'], 'a.end_time':['<',now], 'b.user_id':user_id}).order('a.end_time asc').select();

    list = _.map(list, o=>({...o,end_time:moment.unix(o.end_time).format('YYYY-MM-DD')}));
    let group = _.map(_.groupBy(list,'loan_id'), (o,k)=>({
      info:{
        id:k,
        name:o[0].name,
        mobile:o[0].mobile,
        icloud:o[0].icloud,
        money:o[0].money,
        pay_time:o[0].end_time,
        sum_stage: _.size(o),
        sum_lixi: _.sumBy(o, 'lixi_1') - _.sumBy(o, 'lixi_2'),
        sum_benjin: _.sumBy(o, 'benjin_1') - _.sumBy(o, 'benjin_2')
      },
      items:o}));
    this.assign('group', _.sortBy(group, 'info.pay_time'));
    this.assign('list', list);

    this.assign('link',`http://${this.http.host}/share/qianfei?id=${user_id}`);

    return this.display();
  }
}
