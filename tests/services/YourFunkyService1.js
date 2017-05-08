'use strict';

class YourFunkyService1 {

  /**
   * @param {YourFunkyDependency1} dep1
   * @param {YourFunkyDependency2} scalarService
   */
  constructor(dep1, scalarService) {
    this.dep1 = dep1;
    this.dep2 = scalarService;
  }

}

// and export it
module.exports = YourFunkyService1;
