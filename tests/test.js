'use strict';

const fs = require('fs');
const MikroDI = require('../lib/MikroDI');
const CycleFinder = require('../lib/CycleFinder');

describe('MikroDI', () => {

  describe('Container', () => {
    it('should build container with default options', () => {
      const container = MikroDI.init(['services'], {
        baseDir: __dirname,
      });
      expect(container).toBeInstanceOf(MikroDI);

      const context = container.build();
      expect(context.substr(context.lastIndexOf('/') + 1)).toBe('.context.js');

      const di = fs.readFileSync(context).toString();
      expect(di).toBe(fs.readFileSync(__dirname + '/expected.defaults.js').toString());

      if (fs.existsSync(context)) {
        fs.unlinkSync(context);
      }
    });

    it('should build container with specified options', () => {
      const logger = message => message; // fake logger
      const container = MikroDI.init(['services'], {
        baseDir: __dirname,
        contextDir: __dirname + '/context',
        contextName: 'di.js',
        logger: logger,
      });
      expect(container).toBeInstanceOf(MikroDI);

      const context = container.build();
      expect(context.substr(context.lastIndexOf('/') + 1)).toBe('di.js');

      const di = fs.readFileSync(context).toString();
      expect(di).toBe(fs.readFileSync(__dirname + '/expected.options.js').toString());

      if (fs.existsSync(context)) {
        fs.unlinkSync(context);
      }
    });

    it('should throw error when there is a cycle', () => {
      expect(() => {
        MikroDI.init(['services-w-cycle'], {
          baseDir: __dirname,
          contextName: 'di-cycle.js',
        });
      }).toThrow(`MikroDI: Cyclic dependency found at 'YourFunkyDependency1 -> YourFunkyService2 -> YourFunkyDependency1'!`);
    });
  });

  describe('CycleFinder', () => {
    it('should find cycle [A -> B -> A]', () => {
      const cf = new CycleFinder({
        A: ['B', 'C'],
        B: ['D', 'A'],
        C: [],
        D: [],
      });
      expect(cf.hasCycle()).toBe(true);
      expect(cf.getFoundCycle()).toEqual(['A', 'B', 'A']);
    });

    it('should find cycle [A -> B -> C -> B]', () => {
      const cf = new CycleFinder({
        A: ['B', 'C'],
        B: ['D', 'C'],
        C: ['B'],
        D: [],
      });
      expect(cf.hasCycle()).toBe(true);
      expect(cf.getFoundCycle()).toEqual(['A', 'B', 'C', 'B']);
    });

    it('should find cycle [A -> B -> C -> D -> B]', () => {
      const cf = new CycleFinder({
        A: ['UndefinedDependency', 'B'],
        B: ['C'],
        C: ['D'],
        D: ['B'],
      });
      expect(cf.hasCycle()).toBe(true);
      expect(cf.getFoundCycle()).toEqual(['A', 'B', 'C', 'D', 'B']);
      expect(cf.getFoundCycle('->')).toEqual('A->B->C->D->B');
    });
  });

});
