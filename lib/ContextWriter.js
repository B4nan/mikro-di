'use strict';

const fs = require('fs');

class ContextWriter {

  /**
   * @param {Object} graph
   */
  constructor(graph) {
    this.graph = graph;
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

    let ret = '';
    ret += `  /**\n`;
    ret += `   * @returns {${className}}\n`;
    ret += `   */\n`;
    ret += `  get ${className}() {\n`;
    ret += `    if (!this._map.${className}) {\n`;
    ret += `      const ${className} = require('${node.path}');\n`;

    const dependencies = node.dependencies.map(dep => 'this.' + dep).join(', ');
    if (node.classSyntax) {
      ret += `      this._map.${className} = new ${className}(${dependencies});\n`;
    } else {
      ret += `      ${className}.constructor(${dependencies});\n`;
      ret += `      this._map.${className} = ${className};\n`;
    }

    ret += `    }\n\n`;
    ret += `    return this._map.${className};\n`;
    ret += `  },\n\n`;

    return ret;
  }

}

module.exports = ContextWriter;