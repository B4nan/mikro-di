'use strict';

module.exports = {

  _map: {},

  /**
   * @returns {YourFunkyDependency1}
   */
  get YourFunkyDependency1() {
    if (!this._map.YourFunkyDependency1) {
      const YourFunkyDependency1 = require('./tests/services-w-cycle/YourFunkyDependency1');
      YourFunkyDependency1.constructor(this.YourFunkyService2);
      this._map.YourFunkyDependency1 = YourFunkyDependency1;
    }

    return this._map.YourFunkyDependency1;
  },

  /**
   * @returns {YourFunkyDependency2}
   */
  get YourFunkyDependency2() {
    if (!this._map.YourFunkyDependency2) {
      const YourFunkyDependency2 = require('./tests/services-w-cycle/YourFunkyDependency2');
      this._map.YourFunkyDependency2 = new YourFunkyDependency2();
    }

    return this._map.YourFunkyDependency2;
  },

  /**
   * @returns {YourFunkyService1}
   */
  get YourFunkyService1() {
    if (!this._map.YourFunkyService1) {
      const YourFunkyService1 = require('./tests/services-w-cycle/YourFunkyService1');
      this._map.YourFunkyService1 = new YourFunkyService1(this.YourFunkyDependency1, this.YourFunkyDependency2);
    }

    return this._map.YourFunkyService1;
  },

  /**
   * @returns {YourFunkyService2}
   */
  get YourFunkyService2() {
    if (!this._map.YourFunkyService2) {
      const YourFunkyService2 = require('./tests/services-w-cycle/YourFunkyService2');
      YourFunkyService2.constructor(this.YourFunkyDependency1, this.YourFunkyDependency2);
      this._map.YourFunkyService2 = YourFunkyService2;
    }

    return this._map.YourFunkyService2;
  },

};
