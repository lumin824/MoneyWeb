'use strict';

import Base from './base.js';
import moment from 'moment';

export default class extends Base {

  __before(){
  }

  async indexAction(){
    if(this.isGet()){
      return this.display();
    }else if(this.isPost()){
      let { username, password } = this.param();

      let userModel = this.model('user');
      let user = await userModel.where({
        mobile:username,password
      }).find();

      if(think.isEmpty(user)){
        return this.json({errno:600,errmsg:'错误的用户名密码'});
      }else{
        let { id, mobile } = user;
        await this.model('user').where({id}).update({login_time:moment().unix()});
        await this.session('userInfo',{username, id, mobile});
        return this.json({errno:200,redirect:'/admin'})
      }
    }
  }

  async logoutAction(){
    await this.session();
    return this.redirect('/admin/login');
  }

  async regAction(){
    if(this.isGet()){
      return this.display();
    }else if(this.isPost()){
      let { username, password } = this.param();
      let userModel = this.model('user');
      let ret = await userModel.add({
        mobile:username,password
      });

      if(ret != 1){
        return this.json({errno:600,errmsg:'注册失败'});
      }else{
        let { id, mobile } = user;
        await this.session('userInfo',{username, id, mobile});
        return this.json({errno:200,redirect:'/admin/login'})
      }
    }
  }
}
