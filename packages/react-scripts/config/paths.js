// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

const path = require('path');
const fs = require('fs');
const url = require('url');

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebook/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const envPublicUrl = process.env.PUBLIC_URL;

function ensureSlash(inputPath, needsSlash) {
  const hasSlash = inputPath.endsWith('/');
  if (hasSlash && !needsSlash) {
    return inputPath.substr(0, inputPath.length - 1);
  } else if (!hasSlash && needsSlash) {
    return `${inputPath}/`;
  } else {
    return inputPath;
  }
}

const getPublicUrl = appPackageJson =>
  envPublicUrl || require(appPackageJson).homepage;

// We use `PUBLIC_URL` environment variable or "homepage" field to infer
// "public path" at which the app is served.
// Webpack needs to know it to put the right <script> hrefs into HTML even in
// single-page apps that may serve index.html for nested URLs like /todos/42.
// We can't use a relative path in HTML because we don't want to load something
// like /todos/42/static/js/bundle.7289d.js. We have to know the root.
function getServedPath(appPackageJson) {
  const publicUrl = getPublicUrl(appPackageJson);
  const servedUrl =
    envPublicUrl || (publicUrl ? url.parse(publicUrl).pathname : '/');
  return ensureSlash(servedUrl, true);
}

const moduleFileExtensions = ['mjs', 'js', 'ts', 'tsx', 'json', 'jsx'];
const webModuleFileExtensions = moduleFileExtensions
  .map(ext => 'web.' + ext)
  .concat(moduleFileExtensions);
const nodeModuleFileExtensions = moduleFileExtensions
  .map(ext => 'node.' + ext)
  .concat(moduleFileExtensions);

// Resolve file paths in the same order as webpack
const resolveModule = (
  resolveFn,
  extensions,
  filePath,
  defaultExtension = 'js'
) => {
  let extension = extensions.find(extension =>
    fs.existsSync(resolveFn(`${filePath}.${extension}`))
  );
  if (!extension && defaultExtension) {
    extension = defaultExtension;
  }
  if (extension) {
    return resolveFn(`${filePath}.${extension}`);
  }
};

const webIndexJs = resolveModule(
  resolveApp,
  webModuleFileExtensions,
  'src/index'
);
const nodeIndexJs = resolveModule(
  resolveApp,
  nodeModuleFileExtensions,
  'src/index',
  null
);
const useNodeEnv = nodeIndexJs !== webIndexJs;

// config after eject: we're in ./config/
module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appNodeBuild: useNodeEnv && resolveApp('build/node'),
  appWebBuild: useNodeEnv ? resolveApp('build/web') : resolveApp('build'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveApp('src/index'),
  appWebIndexJs: webIndexJs,
  appNodeIndexJs: useNodeEnv && nodeIndexJs,
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(
    resolveApp,
    nodeModuleFileExtensions,
    'src/setupTests'
  ),
  proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
  servedPath: getServedPath(resolveApp('package.json')),
};

// @remove-on-eject-begin
const resolveOwn = relativePath => path.resolve(__dirname, '..', relativePath);

// config before eject: we're in ./node_modules/react-scripts/config/
module.exports = {
  dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appNodeBuild: useNodeEnv && resolveApp('build/node'),
  appWebBuild: useNodeEnv ? resolveApp('build/web') : resolveApp('build'),
  appPublic: resolveApp('public'),
  appHtml: resolveApp('public/index.html'),
  appIndexJs: resolveApp('src/index'),
  appWebIndexJs: webIndexJs,
  appNodeIndexJs: useNodeEnv && nodeIndexJs,
  appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  appJsConfig: resolveApp('jsconfig.json'),
  yarnLockFile: resolveApp('yarn.lock'),
  testsSetup: resolveModule(
    resolveApp,
    nodeModuleFileExtensions,
    'src/setupTests'
  ),
  proxySetup: resolveApp('src/setupProxy.js'),
  appNodeModules: resolveApp('node_modules'),
  publicUrl: getPublicUrl(resolveApp('package.json')),
  servedPath: getServedPath(resolveApp('package.json')),
  // These properties only exist before ejecting:
  ownPath: resolveOwn('.'),
  ownNodeModules: resolveOwn('node_modules'), // This is empty on npm 3
  appTypeDeclarations: resolveApp('src/react-app-env.d.ts'),
  ownTypeDeclarations: resolveOwn('lib/react-app.d.ts'),
};

const ownPackageJson = require('../package.json');
const reactScriptsPath = resolveApp(`node_modules/${ownPackageJson.name}`);
const reactScriptsLinked =
  fs.existsSync(reactScriptsPath) &&
  fs.lstatSync(reactScriptsPath).isSymbolicLink();

// config before publish: we're in ./packages/react-scripts/config/
if (
  !reactScriptsLinked &&
  __dirname.indexOf(path.join('packages', 'react-scripts', 'config')) !== -1
) {
  const webIndexJs = resolveModule(
    resolveOwn,
    webModuleFileExtensions,
    'template/src/index'
  );
  const nodeIndexJs = resolveModule(
    resolveOwn,
    nodeModuleFileExtensions,
    'template/src/index',
    null
  );

  const useNodeEnv = webIndexJs !== nodeIndexJs;

  module.exports = {
    dotenv: resolveOwn('template/.env'),
    appPath: resolveApp('.'),
    appNodeBuild: useNodeEnv && resolveOwn('../../build/node'),
    appWebBuild: useNodeEnv
      ? resolveOwn('../../build/web')
      : resolveOwn('../../build'),
    appPublic: resolveOwn('template/public'),
    appHtml: resolveOwn('template/public/index.html'),
    appIndexJs: resolveApp('src/index'),
    appWebIndexJs: webIndexJs,
    appNodeIndexJs: useNodeEnv && nodeIndexJs,
    appPackageJson: resolveOwn('package.json'),
    appSrc: resolveOwn('template/src'),
    appTsConfig: resolveOwn('template/tsconfig.json'),
    appJsConfig: resolveOwn('template/jsconfig.json'),
    yarnLockFile: resolveOwn('template/yarn.lock'),
    testsSetup: resolveModule(
      resolveOwn,
      nodeModuleFileExtensions,
      'template/src/setupTests'
    ),
    proxySetup: resolveOwn('template/src/setupProxy.js'),
    appNodeModules: resolveOwn('node_modules'),
    publicUrl: getPublicUrl(resolveOwn('package.json')),
    servedPath: getServedPath(resolveOwn('package.json')),
    // These properties only exist before ejecting:
    ownPath: resolveOwn('.'),
    ownNodeModules: resolveOwn('node_modules'),
    appTypeDeclarations: resolveOwn('template/src/react-app-env.d.ts'),
    ownTypeDeclarations: resolveOwn('lib/react-app.d.ts'),
  };
}
// @remove-on-eject-end

module.exports.nodeModuleFileExtensions = nodeModuleFileExtensions;
module.exports.webModuleFileExtensions = webModuleFileExtensions;
