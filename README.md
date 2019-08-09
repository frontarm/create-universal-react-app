# 💊 Create Universal React App

Create Universal React apps, **with Server Side Rendering (SSR)**, with no build configuration.

This is a fork of Create React App. For details on Create React App itself, see the [official repository](https://github.com/facebook/create-react-app/).

---

## Getting Started

### For new projects

To create a new project with SSR, all you need to do is use `npm init`:

```bash
npm init universal-react-app my-ssr-app
```

Alternatively, you can use plain old create-react-app with a `--react-scripts universal-react-scripts` option:

```bash
create-react-app my-ssr-app --scripts-version universal-react-scripts
```

Either way, you'll get the standard Create React App template with one extra file: `src/index.node.js` (which is where you'll handle server side rendering).

### For existing projects

In your package.json, just change the `react-scripts` dependency to `universal-react-scripts`. _You can leave the occurences of `react-scripts` in the `scripts` object as is._ Then, re-run `yarn install` or `npm install`, and add a `src/index.node.js` file:

```js
import fs from 'fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import './index.css';
import App from './App';

const renderer = async (request, response) => {
  // The index.html file is a template, which will have environment variables
  // and bundled scripts and stylesheets injected during the build step, and
  // placed at the location specified by `process.env.HTML_TEMPLATE_PATH`.
  //
  // To customize the rendered HTML, you can add other placeholder strings,
  // and replace them within this function -- just as %RENDERED_CONTENT% is
  // replaced. Note however that if you name the placeholder after an
  // environment variable available at build time, then it will be
  // automatically replaced by the build script.
  let template = fs.readFileSync(process.env.HTML_TEMPLATE_PATH, 'utf8');
  let [header, footer] = template.split('%RENDERED_CONTENT%');
  let body = renderToString(<App />);
  let html = header + body + footer;
  response.send(html);
};

export default renderer;
```

Your app will now call the function exported by `src/index.node.js` to render its HTML.

## Build output

Universal React Scripts outputs two versions of your app: a browser version, and a node version. The node version is just a common-js version of `index.node.js`, which you can import in your express app or serverless function to handle server side rendering.

## `serve` script

Universal React Scripts includes a `serve` script for testing your build output:

```bash
npm run serve

# or

yarn serve
```

This launches a server for the content in the `build` folder, and when a `index.node.js` file exists, it loads the Node bundle and server the app with server rendering.

## Serverless SSR

CURA can be used to do serverless SSR --for example, using Firebase Functions. To get this working, you'll need to package up the files in `build/node` and then call them within your serverless function.

### With Firebase Functions

**[See the example repository with routes, react-helmet and styled-components &raquo;](https://github.com/jamesknelson/cura-firebase-example)**

You can create a package with your app's commonjs code by setting the `name`, `files` and `main` fields in your app's `package.json`. Once the package is configured correctly, you'll be able to use `npm pack` to create a `tgz` file that can be added as a dependency to your functions `package.json` -- which can be automated by adding a bash script as a `predeploy` step.

**Changes to `package.json`:**

```json
{
  "name": "app",
  "main": "build/node/index.js",
  "files": ["build/node/*.*"],
  "scripts": {
    "deploy": "firebase deploy",
    "predeploy": "sh ./scripts/pack.sh"
  }
}
```

**`scripts/pack.sh`:**

```bash
rm functions/renderer.tgz
npm run build
mv "$(npm pack)" functions/renderer.tgz
```

**`functions/package.json`:**

```json
{
  "optionalDependencies": {
    "app": "./renderer.tgz"
  }
}
```

The result of these three files is that each time you call `yarn deploy` or `npm run deploy`, a version of your app's `index.node.js` file will be built, packaged, and then made available to your firebase functions. You can then import it and use it as so:

```js
const admin = require('firebase-admin');
const functions = require('firebase-functions');

admin.initializeApp();

let renderer;
if (process.env.NODE_ENV === 'production') {
  // Load the renderer from the packaged version when deploying
  renderer = require('app').default;
} else {
  // Load the renderer directly from the build directory during development.
  // Note: the renderer is not used in development as CURA includes its own
  // renderer, but the functions emulator fails without this.
  renderer = require('../build/node').default;
}

exports.renderer = functions.https.onRequest(renderer);
```

Finally, if you're using Firebase Hosting, you'll need to configure it to route all non-static requests to the `renderer` function. Here's what the resulting `firebase.json` looks like:

```json
{
  "hosting": {
    "public": "build/web",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "function": "renderer"
      }
    ]
  }
}
```

_You can see an example of this setup, along with async routing, styled components and react-helmet, at the [cura-firebase-example](https://github.com/jamesknelson/cura-firebase-example) repository._

## The rest is just Create React App

Learn more at the [Create React App](https://facebook.github.io/create-react-app/) website.

If you'd like to understand the changes this fork makes to standard Create React App, see the [Pull Request](https://github.com/facebook/create-react-app/pull/6747).

## License

Create React App is open source software [licensed as MIT](https://github.com/facebook/create-react-app/blob/master/LICENSE).
