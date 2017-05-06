'use strict';

const fs = require('fs');
const _merge = require('lodash.merge');
const CycleFinder = require('./CycleFinder');
const ContextWriter = require('./ContextWriter');
const ServiceParser = require('./ServiceParser');

class MikroDI {

  /**
   * @param {String[]} serviceDirs
   * @param {Object} options
   * @returns {MikroDI} new container instance
   */
  static init(serviceDirs, options) {
    const defaults = {
      logger: null,
      baseDir: process.cwd(),
      contextDir: process.cwd(),
      contextName: '.context.js',
      serviceDirs: serviceDirs,
    };

    // extend with options
    options = _merge(defaults, options);

    // create container and assign it to `require('mikro-di').di`
    const container = new MikroDI(options);
    const context = container.build();
    MikroDI.di = require(context);

    return container;
  }

  /**
   * @param {Object} options
   */
  constructor(options) {
    this.options = options;
  }

  /**
   * @returns {String}
   */
  build() {
    const startTime = Date.now();
    if (this.options.logger) {
      this.options.logger(`DI container building started`);
    }

    const graph = {};
    this.options.serviceDirs.forEach(dir => this._discover(dir, graph));

    const cf = new CycleFinder(graph);
    if (cf.hasCycle()) {
      throw new Error(`MikroDI: Cyclic dependency found at '${cf.getFoundCycle(' -> ')}'!`);
    }

    const file = this.options.contextDir + '/' + this.options.contextName;
    const writer = new ContextWriter(graph);
    writer.save(file);

    if (this.options.logger) {
      const diff = Date.now() - startTime;
      this.options.logger(`- building finished after ${diff} ms`);
    }

    return file;
  }

  /**
   * @param {String} path
   * @param {Object} graph
   * @private
   */
  _discover(path, graph) {
    const files = fs.readdirSync(this.options.baseDir + '/' + path);
    files.forEach(file => {
      if (file.lastIndexOf('.js') === -1 || file.startsWith('.')) {
        return;
      }

      if (this.options.logger) {
        this.options.logger(`- processing service ${file}`);
      }

      const parser = new ServiceParser(this.options.baseDir, this.options.contextDir);
      const node = parser.parse(`${path}/${file}`);
      graph[node.name] = node;
    });
  }

}

module.exports = MikroDI;
