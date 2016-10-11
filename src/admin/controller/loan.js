'use strict';

import Base from './base.js';
import _ from 'lodash';
import moment from 'moment';

var xlsx = require('node-xlsx');
var x = require('xlsx');
import fs from 'fs';

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

  addAction(){
    return this.display();
  }

  async listAction(){
    let { userId:user_id } = this;
    let { page, rows, searchField, searchString, searchOper, sidx, sord, key} = this.param();

    let where = {'user_id':user_id};
    if(key){
      where['mobile|name|icloud|idno']=['like', `%${key}%`];
    }

    this.loan.where(where);

    if(sidx && sord){
      this.loan.order({[sidx]:sord});
    }else{
      this.loan.order({id:'asc'});
    }

    let data = await this.loan.page(page, rows).countSelect();
    return this.json({
      page: data.currentPage,
      records: data.count,
      rows: data.data,
      total: data.totalPages,
    });
  }

  async editAction(){
    let { userId:user_id } = this;
    let { oper, ...data} = this.param();

    let st;
    if(data.start_time){
      st = moment(data.start_time, 'YYYY-MM-DD');
      data.start_time = st.unix();
    }
    if(data.end_time) data.end_time = moment(data.end_time, 'YYYY-MM-DD').unix();

    if(oper == 'add'){

      let { money, total_stage, start_time } = data;
      let m = null;
      let stageNum = 0;
      if(total_stage && (m = total_stage.match(/\d+/))){
        stageNum = m[0];
      }
      money = _.parseInt(money);
      data.end_time = moment(st).add('day', 7 * stageNum).unix();
      data.user_id = user_id;
      let loan_id = await this.loan.add(data);

      if(loan_id && stageNum > 0 && money && stageNum < 40 && st){
        let lixi_1 = Math.floor(money / 1000 * 21);
        let benjin_1 = Math.floor(money / stageNum);

        for(let i = 0; i < stageNum; i++){
          await this.loanStage.add({
            loan_id, stage:i+1,lixi_1,lixi_2:0,benjin_1,benjin_2:0, end_time: st.unix()
          });
          st.add(7,'day');
        }
      }
    }else if(oper == 'edit'){
      let { id, ...udata} = data;
      await this.loan.where({id}).update(udata);
    }else if(oper == 'del'){
      let { id } = data;
      await this.loan.where({id}).delete();
      await this.loanStage.where({loan_id:id}).delete();
    }
    return this.json({});
  }

  async stageAction(){

    if(this.isGet()){
      let {id} = this.param();
      let loan = await this.loan.where({id}).find();
      let list = await this.loanStage.where({loan_id:id}).order({'id':'asc'}).select();
      let update_time = loan.update_time ? moment.unix(loan.update_time).format('YYYY-MM-DD hh:mm:ss') : '无';
      this.assign('loan', {...loan, update_time});
      this.assign('list', _.map(list,o=>({...o,end_time:moment.unix(o.end_time).format('YYYY-MM-DD')})));
      return this.display();
    }else{
      let {id, json, ...data} = this.param();
      let loan_id;
      if(json){
        let self = this;
        let arr = JSON.parse(json);

        for(let i in arr){
          let o = arr[i];
          let {id, ...data} = o;
          if(!loan_id){
            let stage = await this.loanStage.where({id}).find();
            if(stage) loan_id = stage.loan_id;
            console.log(loan_id);
          }
          await this.loanStage.where({id:id}).update(data);
        }
      }else{
        let stage = await this.loanStage.where({id}).find();
        if(stage) loan_id = stage.loan_id;
        await this.loanStage.where({id}).update(data);
      }
      if(loan_id){
        await this.loan.where({id:loan_id}).update({update_time:moment().unix()})
      }


      return this.json({errno:200});
    }


  }

  async uploadAction(){
    let { userId:user_id } = this;
    if(this.isPost()){
      let year = moment().year();
      _.each(this.file(), o=>{
        let list = xlsx.parse(o.path);

        let [header, ...data] = list[0].data;

        let is_new_version = false;
        let stage_step = 3;
        if('苹果ID账号' == header[7]){
          is_new_version = true;
          stage_step = 4;
        }

        _.each(data, async row => {
          let end_date,start_date,mobile,idno,name,money,stage, icloud,stageList;
          if(is_new_version){
            ([start_date,end_date,mobile,idno,name,money,stage, icloud, ...stageList] = row);
          }else{
            ([end_date,start_date,mobile,idno,name,money,stage, ...stageList] = row);
            icloud = stageList[12*3-1];
          }
          if(mobile && idno && name && money && stage){
            let m = null;
            if(_.isNumber(start_date)){
              start_date = _.template('${y}.${m}.${d}')(x.SSF.parse_date_code(start_date));
            }else if( m = start_date.match(/(\d+)月(\d+).+/)){
              start_date = `${year}.${m[1]}.${m[2]}`;
            }else{
              start_date = start_date.replace(/[/]/g,'.');
            }
            if(_.isNumber(end_date))
            {
              end_date = _.template('${y}.${m}.${d}')(x.SSF.parse_date_code(end_date));
            }else if( m = end_date.match(/(\d+)月(\d+).+/)){
              end_date = `${year}.${m[1]}.${m[2]}`;
            }else{
              end_date = end_date.replace(/[/]/g,'.');
            }

            let stageNum = 0;
            if(stage && (m = stage.match(/\d+/))){
              stageNum = m[0];
            }

            end_date = end_date.replace(/[/]/g,'.');
            let start_time = moment(start_date, 'YYYY.MM.DD');
            let end_time = moment(end_date, 'YYYY.MM.DD');
            let loan_id = await this.loan.add({
              start_time: start_time.unix(),end_time:end_time.unix(),
              mobile,idno,name,money,total_stage:stage,icloud,user_id
            });

            money = _.parseInt(money);
            let i = 0;
            let lixi_1 = Math.floor(money / 1000 * 21);
            let benjin_1 = Math.floor(money / stageNum);

            for(; i < 100; i++){
              let lixi_2 = stageList[i*stage_step+0] || 0;
              let benjin_2 = stageList[i*stage_step+1] || 0;
              let lixi = 0, benjin = 0;
              if(is_new_version) ([lixi,benjin]= stageList[i*stage_step+3].split(',')) ;
              if(lixi_2 || benjin_2 || lixi || benjin){

                await this.loanStage.add({
                  loan_id, stage:i+1,lixi,lixi_1,lixi_2,benjin,benjin_1,benjin_2, end_time: start_time.unix()
                })
                start_time.add(7,'day');
              }else{
                break;
              }
            }

            for(; i < stageNum; i++){
              await this.loanStage.add({
                loan_id, stage:i+1, lixi_1,benjin_1,end_time: start_time.unix()
              })
              start_time.add(7,'day');
            }

          }

        });
      });
      return this.json({"jsonrpc" : "2.0", "result" : null, "id" : "id"});
    }
    else if(this.isGet()){
      return this.display();
    }

  }

  async repayAction(){
    if(this.isAjax()){
      let { userId:user_id } = this;
      let { page, rows, searchField, searchString, searchOper, sidx, sord} = this.param();

      this.loanStage
        .field('a.*,b.mobile,b.name,b.icloud')
        .alias('a')
        .join({
          table:'loan',
          as:'b',
          join:'left',
          on:['loan_id','id']
        }).order({'end_time':'asc'});

      let { lixi, benjin, key } = this.param();

      let where = { 'b.user_id':user_id};

      if(lixi == 'true' || benjin == 'true'){
        let where_lixi_benjin = { _logic: 'or' };
        if(lixi == 'true') where_lixi_benjin['a.lixi_1'] = ['EXP', '>a.lixi_2 and a.lixi=0'];
        if(benjin == 'true') where_lixi_benjin['a.benjin_1'] = ['EXP', '>a.benjin_2 and a.benjin=0'];
        where['_complex'] = where_lixi_benjin;
      }

      if(key){
          where['mobile|name|icloud']=['like', `%${key}%`];
      }

      this.loanStage.where(where);

      let data = await this.loanStage.page(page, rows).countSelect();
      return this.json({
        page: data.currentPage,
        records: data.count,
        rows: data.data,
        total: data.totalPages,
      });
    }
    else{
      return this.display();
    }
  }

  async statAction(){
    let { userId:user_id } = this;
    let list = await this.loanStage.query(`select ym,sum(lixi_1) as lixi_1,sum(lixi_2) as lixi_2,sum(benjin_1) as benjin_1,sum(benjin_2) as benjin_2 from (select x.*, date_format(from_unixtime(x.end_time),\'%Y-%m\') as ym from think_loan_stage x left join think_loan y on x.loan_id=y.id where y.user_id=${user_id}) a group by ym order by ym desc;`);
    this.assign('list', list);
    return this.display();
  }

  async qianfeiAction(){
    let { userId:user_id } = this;
    let now = moment();
    now.hour(0);
    now.minute(0);
    now.second(0);
    now.millisecond(0);
    now = now.unix();
    let list = await this.loanStage
    .field('a.*,b.mobile,b.name,b.icloud,b.money')
    .alias('a')
    .join({
      table:'loan',
      as:'b',
      join:'left',
      on:['loan_id','id']
    //}).where(`(a.benjin_1 > a.benjin_2 or a.lixi_1 > a.lixi_2) and a.end_time < ${now}`).order('a.end_time asc').select();
  //}).where({'a.benjin_1':['exp', '>a.benjin_2 or a.lixi_1>a.lixi_2'], 'a.end_time':['<',now], 'b.user_id':user_id})
}).where(`((a.benjin_1>a.benjin_2 and a.benjin=0) or (a.lixi_1>a.lixi_2 and a.lixi=0)) and a.end_time<${now} and b.user_id=${user_id}`)
  .order('a.end_time asc').select();

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
        sum_lixi: _.sumBy(o, p=>p.lixi?0:p.lixi_1-p.lixi_2),
        sum_benjin: _.sumBy(o, p=>p.benjin?0:p.benjin_1-p.benjin_2)
      },
      items:o}));
    this.assign('group', _.sortBy(group, 'info.pay_time'));
    this.assign('list', list);

    this.assign('link',`http://${this.http.host}/share/qianfei?id=${user_id}`);

    return this.display();
  }

  async downloadAction(){
    let { userId:user_id } = this;
    let loanList = await this.loan.where({user_id}).order({id:'asc'}).select();

    let loanStageList = await this.loanStage
    .field('a.*')
    .alias('a')
    .join({
      table:'loan',
      as:'b',
      join:'left',
      on:['loan_id','id']
    })
    .where({'b.user_id':user_id}).order({'a.id':'asc'}).select();

    let data = _.map(loanList, o=>{
      let stage = _(loanStageList).filter({loan_id:o.id})
          .map(o=>[o.lixi_2, o.benjin_2,moment.unix(o.end_time).format('YYYY-MM-DD'), [o.lixi,o.benjin].join(',')])
          .flatten()
          .value();
      return [
        moment.unix(o.start_time).format('YYYY-MM-DD'),
        moment.unix(o.end_time).format('YYYY-MM-DD'),
        o.mobile,o.idno,o.name,o.money,o.total_stage,o.icloud, ...stage
      ];
    });
    let ss = [];
    for(let i=1;i<=24;i++) ss.push(i);
    let workbook = xlsx.build([{name:'Sheet1', data:[['日期','到期','电话号码','身份证','姓名','借款金额','周期','苹果ID账号',..._(ss).map(o=>[`${o}期利息`,'本金','还款日','本金还清,利息还清']).flatten().value()],...data]}]);
    let filepath = `./${user_id}.xlsx`;
    fs.writeFileSync(filepath, workbook, 'binary');
    return this.download(filepath);
  }
}
