const path = require('path');
const pluginTester = require('babel-plugin-tester').default;
const plugin = require('..');

pluginTester({
  plugin,
  pluginName: 'lit-property-sugar',
  babelOptions: {
    plugins: [
      '@babel/plugin-syntax-typescript',
      '@babel/plugin-syntax-class-properties',
      ['@babel/plugin-syntax-decorators', { decoratorsBeforeExport: true }],
    ],
  },
  snapshot: true,
  fixtures: path.resolve(__dirname, 'fixtures'),
});
