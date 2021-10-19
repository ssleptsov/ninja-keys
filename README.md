# Ninja Keys

Keyboard shorcuts interface for your website. Working with static HTML, Vanila JS, Vue, React.

🚧 **Work in progress.** That's first shot for me using [Web Components](https://open-wc.org/) and [Lit Element](https://lit.dev/).

My goal was make a component that will smothly work on full static websites and in same time in Vue.

## Demo

![Demo](./demo-min.gif)

## Usage in plain HTML

### CDN

#### Add to your HTML

```html
<script type="module" src="https://unpkg.com/ninja-keys?module"></script>
```

#### Add to your script file if it's module type

```js
import {NinjaKeys} from 'https://unpkg.com/ninja-keys?module';
```

#### Install from NPM

```bash
npm i ninja-keys
```

If you using webpack, rollup or other build system.

```js
import from 'ninja-keys';
```

### Example

Add tag to your html:

```html
<ninja-keys> </ninja-keys>
```

```html
<script>
  const ninja = document.querySelector('ninja-keys');
  ninja.data = [
    {
      id: 'Projects',
      title: 'Open Projects',
      hotkey: 'ctrl+N',
      icon: 'apps',
      section: 'Projects',
      handler: () => {
        // it's auto register above hotkey with this handler
        alert('Your logic to handle');
      },
    },
    {
      id: 'Theme',
      title: 'Change theme...',
      icon: 'desktop_windows',
      children: ['Light Theme', 'Dark Theme', 'System Theme'],
      hotkey: 'ctrl+T',
      handler: () => {
        // example hotkey to open sub-menu
        ninja.setParent('Theme');
        // if menu closed
        ninja.open();
        // if menu opened that prevent it from closing on select such actions
        return {keepOpen: true};
      },
    },
    {
      id: 'Light Theme',
      title: 'Change theme to Light',
      icon: 'light_mode',
      parent: 'Theme',
      handler: () => {
        // simple handler
        document.documentElement.classList.remove('dark');
      },
    },
    {
      id: 'Dark Theme',
      title: 'Change theme to Dark',
      icon: 'dark_mode',
      parent: 'Theme',
      handler: () => {
        // simple handler
        document.documentElement.classList.add('dark');
      },
    },
  ];
</script>
```

## Dev Server

TBD

```bash
npm run start
```

## Linting

To lint the project run:

```bash
npm run lint
```

## Formatting

[Prettier](https://prettier.io/) is used for code formatting. It has been pre-configured according to the Lit's style.
