'use strict';

import Base from './base.js';

export default class extends Base {

  indexAction(){
    //auto render template file index_index.html
    return this.display();
  }

}
