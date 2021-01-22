![SVG Workflow Designer](assets/cover.png)

# SVG Workflow Designer

[![Build Status](https://travis-ci.com/b4rtaz/workflow-designer.svg?branch=master)](https://travis-ci.com/b4rtaz/workflow-designer) [![License: MIT](https://img.shields.io/github/license/mashape/apistatus.svg)](/LICENSE)

Workflow designer with no dependencies. It's written in TypeScript, but you may use it in a JavaScript project too. This project is not associated with any Workflow Engine. You can use it to integrate it with what you want.

Features:

- no dependencies,
- uses SVG for rendering,
- small size (minified 32 KB),
- works on mobile devices,
- supports IE9 😨,
- light/dark themes.

⭐ Check [online demo](https://b4rtaz.github.io/svg-workflow-designer/examples/fullscreen.html).

## ✨ Installation

### NPM

Enter below command.

```
npm install svg-workflow-designer
```

After this, you can import this library:

```js
import 'svg-workflow-designer/workflow-designer.css';
import { DesignerHost } from 'svg-workflow-designer';
```

## 👀 Examples of Use

Check [examples](/examples) directory.

```js
const designer = new DesignerHost({
   container: document.getElementById('designer'),
   theme: 'dark'
});
designer.setup();
designer.addActivites([
   {
      left: 100,
      top: 100,
      color: '#FFB900',
      name: 'start',
      label: 'Start',
      isInvalid: false,
      canDelete: false,
      inputNames: [],
      outputNames: ['started']
   },
   {
      left: 100,
      top: 200,
      color: '#00D1FF',
      name: 'setVariable',
      label: 'SetVariable',
      isInvalid: false,
      canDelete: true,
      inputNames: ['input'],
      outputNames: ['set']
   }
]);
designer.addConnections([
   {
      outputActivityName: 'start',
      outputName: 'started',
      inputActivityName: 'setVariable',
      inputName: 'input'
   }
]);
```

## ⚙️ How to Build

```
npm install
npm build
```

## 💡 License

This project is released under the MIT license.
