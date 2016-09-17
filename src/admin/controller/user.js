'use strict';

import Base from './base.js';

let userList = [];

export default class extends Base {

  init(http){
    super.init(http);
    this.db = this.model('user');
  }

  indexAction(){
    return this.display();
  }

  async addAction(){
    if(this.isGet()){
      return this.display();
    }else if(this.isPost()){
      let curUser = await this.session('userInfo');
      let { id } = curUser;
      await this.db.add({
        ...this.param(), pid:id
      });
      return this.json({
        errno:200
      });
    }
  }

  async listAction(){
    let list = await this.db.select();
    return this.json({
      rows: list
    });
  }

  async mylistAction(){
    if(this.isAjax()){
      let curUser = await this.session('userInfo');
      let { id } = curUser;
      let list = await this.db.where({pid:id}).select();
      return this.json({
        rows: list
      });
    }else{
      return this.display();
    }

  }

}
