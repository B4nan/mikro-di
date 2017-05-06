'use strict';

class CycleFinder {

  /**
   * @param {Object} graph
   */
  constructor(graph) {
    this.graph = graph;
  }

  /**
   * @returns {Boolean}
   */
  hasCycle() {
    return Object.keys(this.graph).some(service => {
      const visited = {};
      const path = [];

      if (this._dfs(service, visited, path)) {
        this.foundCycle = [service, path];
        return true;
      }

      return false;
    });
  }

  /**
   * @param {String} [glue]
   * @returns {String|String[]}
   */
  getFoundCycle(glue = null) {
    let node = this.foundCycle[0];
    const path = this.foundCycle[1];
    const ret = [node];
    const visited = {};

    do {
      visited[node] = true;
      node = path[node];
      ret.push(node);
    } while (!visited[node]);

    if (glue) {
      return ret.join(glue);
    }

    return ret;
  }

  /**
   * @param {String} service
   * @param {Object} visited
   * @param {String[]} path
   * @param {String} [prev]
   * @return {Boolean}
   * @private
   */
  _dfs(service, visited, path, prev = null) {
    path[prev] = service;

    if (visited[service]) {
      return true;
    }

    // skip unknown dependency (e.g. scalar type like {string})
    if (typeof this.graph[service] === 'undefined') {
      return false;
    }

    visited[service] = true;
    const ret = this.graph[service].some(child => this._dfs(child, visited, path, service));
    visited[service] = false;

    return ret;
  }

}

module.exports = CycleFinder;
