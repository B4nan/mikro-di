'use strict';

const fs = require('fs');
const path = require('path');

class ContextWriter {

  /**
   * @param {Object} graph
   * @param {String} baseDir
   * @param {String} contextDir
   */
  constructor(graph, baseDir, contextDir) {
    this.graph = graph;
    this.baseDir = baseDir;
    this.contextDir = contextDir;
  }

  /**
   * @param {String} path
   */
  save(path) {
    let source = `'use strict';\n\n`;
    source += `module.exports = {\n\n`;
    source += `  _map: {},\n\n`;
    Object.keys(this.graph).forEach(className => source += this._processService(className));
    source += '};\n';

    fs.writeFileSync(path, source);
  }

  /**
   * @param {String} className
   * @private
   */
  _processService(className) {
    const node = this.graph[className];
    const path = this._getRelativePath(node.path);

    let ret = '';
    ret += `  /**\n`;
    ret += `   * @returns {${node.name}}\n`;
    ret += `   */\n`;
    ret += `  get ${className}() {\n`;
    ret += `    if (!this._map.${className}) {\n`;
    ret += `      const ${node.name} = require('${path}');\n`;

    const dependencies = node.dependencies.map(dep => {
      if (dep.startsWith(`'`) || !isNaN(dep)) {
        return dep;
      }

      return 'this.' + dep;
    }).join(', ');
    if (node.classSyntax) {
      ret += `      this._map.${className} = new ${node.name}(${dependencies});\n`;
    } else {
      ret += `      ${className}.constructor(${dependencies});\n`;
      ret += `      this._map.${className} = ${node.name};\n`;
    }

    ret += `    }\n\n`;
    ret += `    return this._map.${className};\n`;
    ret += `  },\n\n`;

    return ret;
  }

  /**
   * @param {String} file
   * @returns {String}
   * @private
   */
  _getRelativePath(file) {
    const relative = path.relative(this.contextDir, this.baseDir + '/' + file.substr(0, file.lastIndexOf('.js')));
    return (relative.startsWith('.') ? relative : './' + relative).replace(path.sep, '/');
  }

}

module.exports = ContextWriter;
