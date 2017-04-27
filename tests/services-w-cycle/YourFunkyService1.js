'use strict';

class YourFunkyService1 {

  /**
   * @param {YourFunkyDependency1} dep1
   * @param {YourFunkyDependency2} dep2
   */
  constructor(dep1, dep2) {
    this.dep1 = dep1;
    this.dep2 = dep2;
  }

}

// and export it
module.exports = YourFunkyService1;
