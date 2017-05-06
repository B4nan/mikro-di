'use strict';

const fs = require('fs');
const path = require('path');
const _merge = require('lodash.merge');
const CycleFinder = require('./CycleFinder');

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

    const graph = {}; // dependency graph for cycle search

    let o = `'use strict';\n\n`;
    o += `module.exports = {\n\n`;
    o += `  _map: {},\n\n`;
    this.options.serviceDirs.forEach(dir => o += this._discover(dir, graph));
    o += '};\n';

    const cf = new CycleFinder(graph);
    if (cf.hasCycle()) {
      throw new Error(`MikroDI: Cyclic dependency found at '${cf.getFoundCycle()}'!`);
    }

    const file = this.options.contextDir + '/' + this.options.contextName;
    fs.writeFileSync(file, o);

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
    let ret = '';

    files.forEach(file => {
      if (file.lastIndexOf('.js') === -1 || file.startsWith('.')) {
        return;
      }

      if (this.options.logger) {
        this.options.logger(`- processing service ${file}`);
      }

      ret += this._processService(`${path}/${file}`, graph);
    });

    return ret;
  }

  /**
   * @param {String} file
   * @param {Object} graph
   * @private
   */
  _processService(file, graph) {
    // load source
    const source = fs.readFileSync(`${this.options.baseDir}/${file}`).toString();
    const classSyntax = new RegExp(/class\s+\w+\s*(?:extends\s+\w+)?\s*{/).test(source);
    const dependencies = this._findDependencies(source, classSyntax);
    const className = file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.js'));
    const path = this._getRelativePath(file);

    // save local dependency map to search for cycles
    graph[className] = dependencies;

    let ret = '';
    ret += `  /**\n`;
    ret += `   * @returns {${className}}\n`;
    ret += `   */\n`;
    ret += `  get ${className}() {\n`;
    ret += `    if (!this._map.${className}) {\n`;
    ret += `      const ${className} = require('${path}');\n`;

    const deps = dependencies.map(dep => 'this.' + dep).join(', ');
    if (classSyntax) {
      ret += `      this._map.${className} = new ${className}(${deps});\n`;
    } else {
      ret += `      ${className}.constructor(${deps});\n`;
      ret += `      this._map.${className} = ${className};\n`;
    }

    ret += `    }\n\n`;
    ret += `    return this._map.${className};\n`;
    ret += `  },\n\n`;

    return ret;
  }

  /**
   * @param {String} source
   * @param {Boolean} classSyntax
   * @return {String[]}
   * @private
   */
  _findDependencies(source, classSyntax) {
    let dependencies = [];

    if (classSyntax) {
      const match = source.match(/\/\*\*\n(?:(.*)\n)*\s*\*\/\n\s*constructor\s*\(/);
      if (match) {
        const lines = match[0].split('\n');
        lines.forEach(line => {
          const param = line.match(/@param {(.*)}/);
          if (param) {
            dependencies.push(param[1]);
          }
        });
      }
    } else {
      const match = source.match(/\$inject: ?\[([^\]]*)]/);
      if (match) {
        dependencies = match[1].replace(/'/g, '').split(/,\s*/);
      }
    }

    return dependencies;
  }

  /**
   * @param {String} file
   * @returns {String}
   * @private
   */
  _getRelativePath(file) {
    const relative = path.relative(this.options.contextDir, this.options.baseDir + '/' + file.substr(0, file.lastIndexOf('.js')));
    return relative.startsWith('.') ? relative : './' + relative;
  }

}

module.exports = MikroDI;
