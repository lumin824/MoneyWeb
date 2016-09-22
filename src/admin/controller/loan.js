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

  addAction(){
    return this.display();
  }

  async listAction(){
    let { page, rows, searchField, searchString, searchOper, sidx, sord} = this.param();

    let db = this.loan;
    if(searchField && searchString && searchOper){
      this.loan.where({[searchField]:{['=']:searchString}});
    }

    if(sidx && sord){
      this.loan.order({[sidx]:sord});
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
    let { oper, ...data} = this.param();

    if(oper == 'add'){
      await this.loan.add(data);
    }else if(oper == 'edit'){
      let { id, ...udata} = data;
      await this.loan.where({id}).update(udata);
    }else if(oper == 'del'){
      let { id } = data;
      await this.loan.where({id}).delete();
    }
    return this.json({});
  }

  async stageAction(){

    if(this.isGet()){
      let {id} = this.param();

      let list = await this.loanStage.where({loan_id:id}).select();
      this.assign('list', _.map(list,o=>({...o,end_time:moment.unix(o.end_time).format('YYYY-MM-DD')})));
      return this.display();
    }else{
      let {id, ...data} = this.param();
      await this.loanStage.where({id:id}).update(data);
      return this.json({errno:200});
    }


  }

  async uploadAction(){
    if(this.isPost()){
      let year = moment().year();
      _.each(this.file(), o=>{
        let list = xlsx.parse(o.path);

        let [header, ...data] = list[0].data;

        _.each(data, async row => {
          let [end_date,start_date,mobile,idno,name,money,stage, ...stageList] = row;
          let icloud = stageList[12*3-1];
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
              mobile,idno,name,money,total_stage:stage,icloud
            });

            money = _.parseInt(money);
            let i = 0;
            let lixi_1 = Math.floor(money / 1000 * 21);
            let benjin_1 = Math.floor(money / stageNum);

            await this.loanStage.add({
              loan_id, stage:1,lixi_1,lixi_2:lixi_1,benjin_1,benjin_2:benjin_1, end_time: start_time.unix()
            });

            for(; i < 100; i++){
              let lixi = stageList[i*3+0];
              let benjin = stageList[i*3+1];
              if(lixi && benjin){
                start_time.add(7,'day');
                await this.loanStage.add({
                  loan_id, stage:i+2,lixi_1,lixi_2:lixi,benjin_1,benjin_2:benjin, end_time: start_time.unix()
                })
              }else{
                break;
              }
            }

            for(; i < stageNum-1; i++){
              start_time.add(7,'day');
              await this.loanStage.add({
                loan_id, stage:i+1, lixi_1,benjin_1,end_time: start_time.unix()
              })
            }

          }

          console.log(ret)
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

      let { lixi, benjin } = this.param();
      let where = _.compact([ lixi == 'true' && 'a.lixi_1 > a.lixi_2', benjin == 'true' && 'a.benjin_1 > a.benjin_2']).join(' or ');

      if(where){
        this.loanStage.where(where);
      }

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
}
