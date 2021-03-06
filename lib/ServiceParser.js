'use strict';

const fs = require('fs');

class ServiceParser {

  /**
   * @param {String} baseDir
   * @param {Object} services
   */
  constructor(baseDir, services) {
    this.baseDir = baseDir;
    this.services = services;
  }

  /**
   * @param {String} file
   */
  parse(file) {
    const source = fs.readFileSync(`${this.baseDir}/${file}`).toString();
    const classSyntax = new RegExp(/class\s+\w+\s*(?:extends\s+\w+)?\s*{/).test(source);

    return {
      name: file.substring(file.lastIndexOf('/') + 1, file.lastIndexOf('.js')),
      dependencies: this._findDependencies(source, classSyntax),
      path: file,
      classSyntax: classSyntax,
    };
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
          const param = line.match(/@param {(.*)} (\w+)/);
          if (param) {
            dependencies.push(this.services[param[2]] ? param[2] : param[1]);
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

}

module.exports = ServiceParser;
