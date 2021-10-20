import {LitElement, html, css, TemplateResult, PropertyValues} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import hotkeys from 'hotkeys-js';
import {classMap} from 'lit/directives/class-map.js';
import './ninja-header';
import './ninja-action';
import {INinjaAction} from './interfaces/ininja-action';
import {live} from 'lit/directives/live.js';
import {createRef, ref} from 'lit-html/directives/ref.js';
import {NinjaHeader} from './ninja-header';
import {NinjaAction} from './ninja-action';

@customElement('ninja-keys')
export class NinjaKeys extends LitElement {
  static override styles = css`
    :host {
      font-family: var(--ninja-keys-font-family, Inter);
      --ninja-keys-text-color: rgb(60, 65, 73);
      text-align: left;
    }

    .modal {
      display: none;
      position: fixed;
      z-index: 1;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      overflow: auto;
      background: rgba(255, 255, 255, 0.5);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      backdrop-filter: saturate(180%) blur(2px);
      /* font-family: var(--font-sans); */
      /* backdrop-filter: blur(2px); */
    }
    .modal.visible {
      display: block;
    }

    /* Modal Content */
    .modal-content {
      position: relative;
      top: 20%;
      margin: auto;
      padding: 0;

      display: flex;
      flex-direction: column;
      flex-shrink: 1;
      -webkit-box-flex: 1;
      flex-grow: 1;
      min-width: 0px;
      will-change: transform;
      background: linear-gradient(
        136.61deg,
        rgb(255, 255, 255) 13.72%,
        rgb(255, 255, 255) 74.3%
      );
      border-radius: 8px;
      box-shadow: rgb(0 0 0 / 50%) 0px 16px 70px;
      max-width: 640px;
      font-size: 14px;
      color: var(--ninja-keys-text-color);
      overflow: hidden;
    }

    .bump {
      animation: zoom-in-zoom-out 0.2s ease;
    }

    @keyframes zoom-in-zoom-out {
      0% {
        transform: scale(0.99);
      }
      50% {
        transform: scale(1.01, 1.01);
      }
      100% {
        transform: scale(1, 1);
      }
    }

    .ninja-github {
      color: var(--ninja-keys-text-color);
      font-weight: normal;
      text-decoration: none;
    }

    .actions-list {
      max-height: 300px;
      overflow: auto;
      scroll-behavior: smooth;
      position: relative;
      margin: 0;
      padding: 16px 0;
      list-style: none;
      scroll-behavior: smooth;
    }

    .group-header {
      height: 22px;
      line-height: 22px;
      padding-left: 20px;
      text-overflow: ellipsis;
      white-space: nowrap;
      overflow: hidden;
      font-size: 12px;
      color: rgb(144, 149, 157);
      margin: 1px 0;
    }

    .modal-footer {
      background: rgba(242, 242, 242, 0.4);
      padding: 8px 16px;
      display: flex;
      font-size: 12px;
      border-top: 1px solid rgb(239, 241, 244);
      color: rgb(107, 111, 118);
    }

    .modal-footer .help {
      display: flex;
      margin-right: 16px;
      align-items: center;
    }

    .ninja-examplekey {
      background: rgb(239, 241, 244);
      padding: 1px 4px;
      border-radius: 3px;
      min-width: 20px;
      color: rgb(107, 111, 118);
      font-size: 12px;
      width: 15px;
      height: 15px;
      margin-right: 8px;
      fill: currentColor;
    }
  `;

  /**
   * Show or hide element
   */
  @property({type: Boolean})
  visible = false;

  /**
   * Search placeholder text
   */
  @property({type: String})
  placeholder = 'Type a command or search...';

  /**
   * If true will register all hotkey for all actions
   */
  @property({type: Boolean})
  disableHotkeys = false;

  /**
   * Show or hide breadcrumbs on header
   */
  @property({type: Boolean})
  hideBreadcrumbs = false;

  /**
   * Open or hide shorcut
   */
  @property()
  openHotkey = 'cmd+k,ctrl+k';

  /**
   * Navigation Up hotkey
   */
  @property()
  navigationUpHotkey = 'up,shift+tab';

  /**
   * Navigation Down hotkey
   */
  @property()
  navigationDownHotkey = 'down,tab';

  /**
   * Close hotkey
   */
  @property()
  closeHotkey = 'esc';

  /**
   * Go back on one level if has parent menu
   */
  @property()
  goBackHotkey = 'backspace';

  /**
   * Select action and execute handler or open submenu
   */
  @property()
  selectHotkey = 'enter'; // enter,space

  /**
   * Array of actions
   */
  @property({type: Array})
  data = [] as Array<INinjaAction>;

  /**
   * Temproray used for animation effect. TODO: change to animate logic
   */
  @state()
  private _bump = true;

  @state()
  private _actionMatches = [] as Array<INinjaAction>;

  @state()
  private _search = '';

  @state()
  private _currentRoot?: string;

  @state()
  private get breadcrumbs() {
    const path: string[] = [];
    let parentAction = this._selected?.parent;
    if (parentAction) {
      path.push(parentAction);
      while (parentAction) {
        const action = this.data.find((a) => a.id === parentAction);
        if (action?.parent) {
          path.push(action.parent);
        }
        parentAction = action ? action.parent : undefined;
      }
    }
    return path.reverse();
  }

  @state()
  private _selected?: INinjaAction;

  /**
   * Show a modal
   */
  open() {
    this._bump = true;
    this.visible = true;
    this._headerRef.value!.focusSearch();
  }

  /**
   * Close modal
   */
  close() {
    this._bump = false;
    this.visible = false;
  }

  setParent(parent?: string) {
    if (!parent) {
      this._currentRoot = undefined;
      // this.breadcrumbs = [];
    } else {
      this._currentRoot = parent;
    }
  }

  override connectedCallback() {
    super.connectedCallback();
    this._registerInternalHotkeys();
  }

  override update(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('data') && !this.disableHotkeys) {
      this.data
        .filter((action) => !!action.hotkey)
        .forEach((action) => {
          hotkeys(action.hotkey!, (event) => {
            event.preventDefault();
            if (action.handler) {
              action.handler();
            }
          });
        });
    }
    super.update(changedProperties);
  }

  private _registerInternalHotkeys() {
    if (this.openHotkey) {
      hotkeys(this.openHotkey, (event) => {
        event.preventDefault();
        this.visible ? this.close() : this.open();
      });
    }

    if (this.selectHotkey) {
      hotkeys(this.selectHotkey, (event) => {
        if (!this.visible) {
          return;
        }
        event.preventDefault();
        this._actionSelected({
          detail: this._actionMatches[this._selectedIndex],
        });
      });
    }

    if (this.goBackHotkey) {
      hotkeys(this.goBackHotkey, (event) => {
        if (!this.visible) {
          return;
        }
        if (!this._search) {
          event.preventDefault();
          this._goBack();
        }
      });
    }

    if (this.navigationDownHotkey) {
      hotkeys(this.navigationDownHotkey, (event) => {
        if (!this.visible) {
          return;
        }
        event.preventDefault();
        if (this._selectedIndex >= this._actionMatches.length - 1) {
          this._selected = this._actionMatches[0];
        } else {
          this._selected = this._actionMatches[this._selectedIndex + 1];
        }
      });
    }

    if (this.navigationUpHotkey) {
      hotkeys(this.navigationUpHotkey, (event) => {
        if (!this.visible) {
          return;
        }
        event.preventDefault();
        if (this._selectedIndex === 0) {
          this._selected = this._actionMatches[this._actionMatches.length - 1];
        } else {
          this._selected = this._actionMatches[this._selectedIndex - 1];
        }
      });
    }

    if (this.closeHotkey) {
      hotkeys(this.closeHotkey, () => {
        if (!this.visible) {
          return;
        }
        this.close();
      });
    }
  }

  private _actionFocused(index: INinjaAction, $event: MouseEvent) {
    // this.selectedIndex = index;
    this._selected = index;
    ($event.target as NinjaAction).ensureInView();
  }

  private _onTransitionEnd() {
    this._bump = false;
  }

  private _goBack() {
    const parent =
      this.breadcrumbs.length > 1
        ? this.breadcrumbs[this.breadcrumbs.length - 2]
        : undefined;
    this.setParent(parent);
  }

  private _headerRef = createRef<NinjaHeader>();

  override render() {
    const classes = {
      bump: this._bump,
      'modal-content': true,
    };

    const menuClasses = {
      visible: this.visible,
      modal: true,
    };

    this._actionMatches = this.data.filter((action) => {
      if (!this._currentRoot && this._search) {
        // global search for items on root
        return action.title.match(new RegExp(this._search, 'gi'));
      }

      return (
        action.parent === this._currentRoot &&
        action.title.match(new RegExp(this._search, 'gi'))
      );
    });

    if (this._actionMatches.length > 0 && this._selectedIndex === -1) {
      this._selected = this._actionMatches[0];
    }
    if (this._actionMatches.length === 0) {
      this._selected = undefined;
    }

    const sections = this._actionMatches.reduce(
      (entryMap, e) =>
        entryMap.set(e.section, [...(entryMap.get(e.section) || []), e]),
      new Map()
    );

    const actionsList = (actions: INinjaAction[]) =>
      html` ${repeat(
        actions,
        (action) => action.id,
        (action) =>
          html`<ninja-action
            .selected=${live(action.id === this._selected?.id)}
            @mouseover=${($event: MouseEvent) =>
              this._actionFocused(action, $event)}
            @actionsSelected=${this._actionSelected}
            .action=${action}
          ></ninja-action>`
      )}`;

    const itemTemplates: TemplateResult[] = [];
    sections.forEach((actions, section) => {
      const header = section
        ? html`<div class="group-header">${section}</div>`
        : undefined;
      itemTemplates.push(html`${header}${actionsList(actions)}`);
    });

    return html`
      <div @click=${this._overlayClick} class=${classMap(menuClasses)}>
        <div class=${classMap(classes)} @animationend=${this._onTransitionEnd}>
          <ninja-header
            ${ref(this._headerRef)}
            .placeholder=${this.placeholder}
            .hideBreadcrumbs=${this.hideBreadcrumbs}
            .breadcrumbs=${this.breadcrumbs}
            @change=${this._handleInput}
            @setParent=${(event: CustomEvent) =>
              this.setParent(event.detail.parent)}
            @close=${this.close}
          >
          </ninja-header>
          <div class="modal-body">
            <div class="actions-list">${itemTemplates}</div>
          </div>
          <slot name="footer">
            <div class="modal-footer" slot="footer">
              <span class="help">
                <svg
                  version="1.0"
                  class="ninja-examplekey"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1280 1280"
                >
                  <path
                    d="M1013 376c0 73.4-.4 113.3-1.1 120.2a159.9 159.9 0 0 1-90.2 127.3c-20 9.6-36.7 14-59.2 15.5-7.1.5-121.9.9-255 1h-242l95.5-95.5 95.5-95.5-38.3-38.2-38.2-38.3-160 160c-88 88-160 160.4-160 161 0 .6 72 73 160 161l160 160 38.2-38.3 38.3-38.2-95.5-95.5-95.5-95.5h251.1c252.9 0 259.8-.1 281.4-3.6 72.1-11.8 136.9-54.1 178.5-116.4 8.6-12.9 22.6-40.5 28-55.4 4.4-12 10.7-36.1 13.1-50.6 1.6-9.6 1.8-21 2.1-132.8l.4-122.2H1013v110z"
                  />
                </svg>

                to select
              </span>
              <span class="help">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="ninja-examplekey"
                  viewBox="0 0 24 24"
                >
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path
                    d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"
                  />
                </svg>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="ninja-examplekey"
                  viewBox="0 0 24 24"
                >
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path
                    d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"
                  />
                </svg>
                to navigate
              </span>
              <span class="help">
                <span class="ninja-examplekey">esc</span>
                to close
              </span>
              <span class="help">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="ninja-examplekey"
                  viewBox="0 0 24 24"
                >
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path
                    d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
                  />
                </svg>
                move to parent
              </span>
            </div>
          </slot>
        </div>
      </div>
    `;
  }

  private get _selectedIndex(): number {
    if (!this._selected) {
      return -1;
    }
    return this._actionMatches.indexOf(this._selected);
  }

  private _actionSelected(event: {detail: INinjaAction}) {
    if (event.detail.children && event.detail.children?.length > 0) {
      this._currentRoot = event.detail.id;
      this._search = '';
    }

    this._headerRef.value!.setSearch('');
    this._headerRef.value!.focusSearch();

    if (event.detail.handler) {
      const result = event.detail.handler();
      if (!result?.keepOpen) {
        this.close();
      }
    }

    this._bump = true;
  }

  private _handleInput(event: CustomEvent) {
    this._search = event.detail.search;
  }

  private _overlayClick(event: Event) {
    if ((event.target as HTMLElement)?.classList.contains('modal')) {
      this.close();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ninja-keys': NinjaKeys;
  }
}
