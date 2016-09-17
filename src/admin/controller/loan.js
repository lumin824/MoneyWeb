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
    let {id} = this.param();

    let list = await this.loanStage.where({loanId:id}).select();
    this.assign('list', list);
    return this.display();
  }

  async uploadAction(){
    if(this.isPost()){
      let year = moment().year();
      _.each(this.file(), o=>{
        let list = xlsx.parse(o.path);

        let [header, ...data] = list[0].data;

        _.each(data, async row => {
          let [endDate,startDate,mobile,idno,name,money,stage, ...stageList] = row;
          console.log([mobile , idno , name , money , stage]);
          let icloud = stageList[12*3-1];
          if(mobile && idno && name && money && stage){
            let m = null;
            if(_.isNumber(startDate)){
              startDate = _.template('${y}.${m}.${d}')(x.SSF.parse_date_code(startDate));
            }else if( m = startDate.match(/(\d+)月(\d+).+/)){
              startDate = `${year}.${m[1]}.${m[2]}`;
            }else{
              startDate = startDate.replace(/[/]/g,'.');
            }
            if(_.isNumber(endDate))
            {
              endDate = _.template('${y}.${m}.${d}')(x.SSF.parse_date_code(endDate));
            }else if( m = endDate.match(/(\d+)月(\d+).+/)){
              endDate = `${year}.${m[1]}.${m[2]}`;
            }else{
              endDate = endDate.replace(/[/]/g,'.');
            }

            endDate = endDate.replace(/[/]/g,'.');
            let loanId = await this.loan.add({
              endDate, startDate,
              mobile,idno,name,money,stage,icloud
            });

            for(let i = 0; i < 100; i++){
              let glf = stageList[i*3+0];
              let bj = stageList[i*3+1];
              let lx = stageList[i*3+2];
              if(glf && bj && lx){
                await this.loanStage.add({
                  loanId, stage:i+1,glf,bj,lx
                })
              }else{
                break;
              }
            }
          }


          // await this.loanStage.add({
          //   loanId,
          // })

          console.log(ret)
        });
      });
      return this.json({"jsonrpc" : "2.0", "result" : null, "id" : "id"});
    }
    else if(this.isGet()){
      return this.display();
    }

  }
}
