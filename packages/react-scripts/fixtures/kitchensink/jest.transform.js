const babelOptions = { presets: ['universal-react-app'] };

module.exports = require('babel-jest').createTransformer(babelOptions);
