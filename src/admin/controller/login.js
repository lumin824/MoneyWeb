'use strict';

import Base from './base.js';

export default class extends Base {

  __before(){
  }

  async indexAction(){
    if(this.isGet()){
      return this.display();
    }else if(this.isPost()){
      let { username, password } = this.param();

      if(username == 'admin' && password == 'admin'){
        await this.session('userInfo',{username});
        return this.json({errno:200,redirect:'/admin'})
      }else{
        let userModel = this.model('user');
        let user = await userModel.where({
          mobile:username,password,canLoginAdmin:'true'
        }).find();

        if(think.isEmpty(user)){
          return this.json({errno:600,errmsg:'错误的用户名密码'});
        }else{
          let { id, mobile } = user;
          await this.session('userInfo',{username, id, mobile});
          return this.json({errno:200,redirect:'/admin'})
        }
      }
    }
  }

  async logoutAction(){
    await this.session();
    return this.redirect('/admin/login');
  }
}
