'use strict';

export default class extends think.controller.base {
  async __before(){
    let userInfo = await this.session('userInfo');
    if(think.isEmpty(userInfo)){
      return this.redirect('/admin/login');
    }
  }
}
