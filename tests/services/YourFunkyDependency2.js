'use strict';

class YourFunkyDependency2 {

  /**
   * @param {String} namespace
   */
  constructor(namespace) {
    this.name = 'YourFunkyDependency2';
    this.namespace = namespace;
  }

}

// and export it
module.exports = YourFunkyDependency2;
