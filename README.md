# Ninja Keys

Keyboard shortcuts interface for your website. Working with Vanilla JS, Vue, React.

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fssleptsov%2Fninja-keys.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fssleptsov%2Fninja-keys?ref=badge_shield)
![npm](https://img.shields.io/npm/v/ninja-keys)
![npm](https://img.shields.io/npm/dw/ninja-keys)

## Demo

[https://ninja-keys-demo.vercel.app/](https://ninja-keys-demo.vercel.app/)
![Demo](./docs/demo-min.gif)

## Motivation
A lot of applications support that pattern, user hit <kbd>⌘</kbd>+<kbd>k</kbd> (or <kbd>ctrl</kbd>+<kbd>k</kbd>) and search UI dialog appear. 
I've seen recently in Notion, Slack, Linear, Vercel and Algolia, but I'm sure there are plenty more.
Also, there is a Apple Spotlight, Alfred and Raycast app that using this pattern too but different shortcuts.
There are already some libraries but they are too framework specific, like [Laravel only](https://github.com/livewire-ui/spotlight) or [React only](https://github.com/timc1/kbar) 
Althought, mine is not a silver bullet and if you need more framework integration, check them out too.

I was needed an keyboard interface for navigation for static website without any frameworks.
In same time I have a few vue projects where it can be useful too.
So I decided to give first shot for [Web Components](https://open-wc.org/) and [Lit Element](https://lit.dev/).


## Integrations
- [Vue Example - Codesandbox](https://codesandbox.io/s/ninja-keys-demo-vue3-bps5w?file=/public/index.html)
- [React Example - Codesandbox](https://codesandbox.io/s/ninja-keys-demo-reactjs-rlv4b?file=/src/App.js)
- [React/NextJS](https://github.com/ssleptsov/ninja-keys-demo/blob/master/components/LayoutWrapper.js#L14-L71)
- [Static Html - Codesandbox](https://codesandbox.io/s/ninja-keys-demo-html-cf9wy?file=/index.html)
- [Svelte - Codesandbox](https://codesandbox.io/s/ninja-keys-demo-svelte-r31l8)

## Features
- Keyboard navigation
- Light and dark theme build in
- Build-in icons support from Material font, can support custom svg icons too.
- Nested menu. Tree or flat data structure can be used
- Auto register your shortcuts
- Root search, for example, if search "Dark" it will find it within the "Theme" submenu
- CSS variable to customize the view
- Customizable hotkeys to open/close and etc. Choose what fit your website more.


## Why "Ninja" name?
Because it appears from nowhere and executes any actions quickly.
Or because it allows your users to become keyboard ninja's 🙃

## Install from NPM 
```bash
npm i ninja-keys
```
Import if you are using webpack, rollup, vite or other build system.
```js
import 'ninja-keys';
```

## Install from CDN
Mostly for usage in HTML/JS without build system.
```html
<script type="module" src="https://unpkg.com/ninja-keys?module"></script>
```
or inside your module scripts
```html
<script type="module">
  import {NinjaKeys} from 'https://unpkg.com/ninja-keys?module';
</script>
```

### Usage

Add tag to your html.

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
        // open menu if closed. Because you can open directly that menu from it's hotkey
        ninja.open({ parent: 'Theme' });
        // if menu opened that prevent it from closing on select that action, no need if you don't have child actions
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
Library using flat data structure inside, as in example above. But you can also use tree structure as below:
```js
{
  id: 'Theme',
  children: [
    { id: ':ight' title: 'light_mode', },
    { id: 'System Theme',
      children: [
        { title: 'Sub item 1' },
        { title: 'Sub item 2' }
      ]
    }
  ]
}
```
## Attributes
| Field                | Default                     | Description                                                 |
|----------------------|-----------------------------|-------------------------------------------------------------|
| placeholder          | Type a command or search... | Placeholder for search                                      |
| disableHotkeys       | false                       | If attribute exist will register all hotkey for all actions |
| hideBreadcrumbs      | false                       | Hide breadcrumbs on header if true                          |
| openHotkey           | cmd+k,ctrl+k                | Open or close shortcut                                      |
| navigationUpHotkey   | up,shift+tab                | Navigation up shortcuts                                     |
| navigationDownHotkey | down,tab                    | Navigation down shortcuts                                   |
| closeHotkey          | esc                         | Close shortcut                                               |
| goBackHotkey         | backspace                   | Go back on one level if has parent menu                     |
| selectHotkey         | enter                       | Select action and execute handler or open submenu           |
| hotKeysJoinedView    | false                       | If exist/true will display hotkeys inside one element       |
| noAutoLoadMdIcons    | false                       | If exist it disable load material icons font on connect     |
#### Example
```html
<ninja-keys placeholder="Must app is awesome" openHotkey="cmd+l" hideBreadcrumbs></ninja-keys>
```

## Data
Array of `INinjaAction` - interface properties below
| Name     | Type                    | Description                                                                            |
|----------|-------------------------|----------------------------------------------------------------------------------------|
| id       | string                  | Unique id/text. Will be displayed as breadcrumb in multimenu                           |
| title    | string                  | Title of action                                                                        |
| hotkey   | string(optional)        | Shortcut to display and register                                                       |
| handler  | Function(optional)      | Function to execute on select                                                          |
| mdIcon   | string(optional)        | Material Design font icon name                                                         |
| icon     | string(optional)        | Html to render as custom icon                                                          |
| parent   | string(optional)        | If using flat structure use id of actions to make a multilevel menu                    |
| keywords | string(optional)        | Keywords to use for search                                                             |
| children | Array<string>(optional) | If using flat structure then ids of child menu actions. Not required on tree structure |
| section  | string(optional)        | Section text. Like a header will be group with other same sections                     |

## Methods
| Name      | Arg                 | Description                                         |
|-----------|---------------------|-----------------------------------------------------|
| `open`      | { parent?: string } | Open menu with parent, if null them open root menu  |
| `close`     |                     | Close menu                                          |
| `setParent` | parent?: string     | Navigate to parent menu                             |
#### Example
```js
const ninja = document.querySelector('ninja-keys');
ninja.open() 
// or
ninja.open({ parent: 'Theme' })
```

### Events
Component wide events

| Name                               | Description                         | Payload |
|------------------------------------|-------------------------------------| ------- |
| `change`                         | Emitted when on each change of search input | `{ detail: { search: string, actions: Array<NinjaAction> } }` |
| `selected`                       | Emitted when on user selected action or on submit of input | `{ detail: { search: string, action: NinjaAction or undefined }}` |

Both `handler` of action and component event `selected` emitted when user submit form or select item.

But event `selected` can be used to handle edge cases, it's not recommended to write each action logic here, better to use action `handler` property.

For example, user enter search query and there is empty list, listening to this event you can handle that.

```js
ninja.addEventListener('change', (event) => {
  console.log('ninja on change', event.detail);
  // detail = {search: 'your search query', actions: Array<NinjaAction>}
})
ninja.addEventListener('selected', (event) => {
  console.log('ninja on selected', event.detail);
  // detail = {search: 'your search query', action: NinjaAction | undefined }
  if (event.detail.action){
  // perform API search for example
  }
   
})
```

## Themes
Component support dark theme out-of-box. You just need to add a class. 
```html
<ninja-keys class="dark"></ninja-keys>
```

If you need more style control, use css variable below.
### CSS variables
| Name                               | Default                            |
|------------------------------------|------------------------------------|
| --ninja-width                     | 640px;                              |
| --ninja-backdrop-filter            | none;                              |
| --ninja-overflow-background        | rgba(255, 255, 255, 0.5);          |
| --ninja-text-color                 |  rgb(60, 65, 73);                  |
| --ninja-font-size                  | 16px;                              |
| --ninja-top                        | 20%;                               |
| --ninja-key-border-radius          | 0.25em                             |
| --ninja-accent-color               | rgb(110, 94, 210);                 |
| --ninja-secondary-background-color | rgb(239, 241, 244);                |
| --ninja-secondary-text-color       |  rgb(107, 111, 118);               |
| --ninja-selected-background        | rgb(248, 249, 251);                |
| --ninja-icon-color                 | var(--ninja-secondary-text-color); |
|     --ninja-icon-size         | 1.2em;                                             |
|     --ninja-separate-border   | 1px solid var(--ninja-secondary-background-color); |
|     --ninja-modal-background  | #fff;                                              |
|     --ninja-modal-shadow      | rgb(0 0 0 / 50%) 0px 16px 70px;                    |
|     --ninja-actions-height    | 300px;                                             |
|     --ninja-group-text-color  |  rgb(144, 149, 157);                               |
|     --ninja-footer-background | rgba(242, 242, 242, 0.4);                          |


#### Example
```css
ninja-keys {
  --ninja-width: 400px;
}
```

### CSS Shadow Parts
Allowing you to style spesific elemtents from your style.
Because styles encapsulated by Shadow DOM, it will be annoying to create css variables for all properties.
That's why you can use `::part` to make custom look of component.
It's supported by [all modern browsers](https://caniuse.com/mdn-css_selectors_part)

| Name                               | Description                         |
|------------------------------------|-------------------------------------|
| actions-list                       | Element that wraps all child elements. |
| ninja-action                       | Single action                       |
| ninja-selected                     | Selected action                    |

#### Example style using parts
```css
ninja-keys::part(actions-list) {
  padding: 8px;
}
ninja-keys::part(ninja-action) {
  border-radius: 8px;
  border-left: none;
}

ninja-keys::part(ninja-selected) {
  background: rgba(51, 51, 51, 0.1);
}
```

### Icons
By default component using icons from [https://fonts.google.com/icons](https://fonts.google.com/icons)

For example, you can just set `mdIcon` to `light_mode` to render sun icon.

To add Material icons for website you need to add to html, for example
```html
<link href="https://fonts.googleapis.com/css?family=Material+Icons&display=block" rel="stylesheet">
```

If want custom icons, you can use `svg` or `img` to insert it with `icon` property for action with `ninja-icon` class.
Example:
```js
{
  title: 'Search projects...',
  icon: `<svg xmlns="http://www.w3.org/2000/svg" class="ninja-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>`,
  section: 'Projects',
},
```
Also, you can change width and font using css variables for it
```css
ninja-keys {
  --ninja-icon-size: 1em;
}
```


### Change or hide footer
```html
<ninja-keys> 
  <slot name="footer">Must custom footer or empty to hide</slot>
</ninja-keys>
```


## Dev Server

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

## License

Copyright (c) [Sergei Sleptsov](https://sergei.ws) <hey@sergei.ws>

Licensed under [the MIT license](./LICENSE).

[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fssleptsov%2Fninja-keys.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fssleptsov%2Fninja-keys?ref=badge_large)
