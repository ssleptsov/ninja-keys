import {LitElement, html, TemplateResult, PropertyValues} from 'lit';
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
import {footerHtml} from './ninja-footer';
import {baseStyles} from './base-styles';

@customElement('ninja-keys')
export class NinjaKeys extends LitElement {
  static override styles = [baseStyles];

  /**
   * Show or hide element
   */
  @property({type: Boolean}) visible = false;

  /**
   * Search placeholder text
   */
  @property({type: String}) placeholder = 'Type a command or search...';

  /**
   * If true will register all hotkey for all actions
   */
  @property({type: Boolean}) disableHotkeys = false;

  /**
   * Show or hide breadcrumbs on header
   */
  @property({type: Boolean}) hideBreadcrumbs = false;

  /**
   * Open or hide shorcut
   */
  @property() openHotkey = 'cmd+k,ctrl+k';

  /**
   * Navigation Up hotkey
   */
  @property() navigationUpHotkey = 'up,shift+tab';

  /**
   * Navigation Down hotkey
   */
  @property() navigationDownHotkey = 'down,tab';

  /**
   * Close hotkey
   */
  @property() closeHotkey = 'esc';

  /**
   * Go back on one level if has parent menu
   */
  @property() goBackHotkey = 'backspace';

  /**
   * Select action and execute handler or open submenu
   */
  @property() selectHotkey = 'enter'; // enter,space

  /**
   * Show or hide breadcrumbs on header
   */
  @property({type: Boolean}) hotKeysJoinedView = false;

  /**
   * Disable load material icons font on connect
   * If you use custom icons. 
   * Set this attribute to prevent load default icons font
   */
  @property({type: Boolean}) noAutoLoadMdIcons = false;


  /**
   * Array of actions
   */
  @property({type: Array}) data = [] as Array<INinjaAction>;

  /**
   * Public methods
   */

  /**
   * Show a modal
   */
  open(options: {parent?: string} = {}) {
    this._bump = true;
    this.visible = true;
    this._headerRef.value!.focusSearch();
    this.setParent(options.parent);
  }

  /**
   * Close modal
   */
  close() {
    this._bump = false;
    this.visible = false;
  }

  /**
   * Navigate to group of actions
   * @param parent id of parent group/action
   */
  setParent(parent?: string) {
    if (!parent) {
      this._currentRoot = undefined;
      // this.breadcrumbs = [];
    } else {
      this._currentRoot = parent;
    }
    this._search = '';
    this._headerRef.value!.setSearch('');
  }

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

  /**
   * Array of actions in flat structure
   */
  @state() _flatData = [] as Array<INinjaAction>;

  @state()
  private get breadcrumbs() {
    const path: string[] = [];
    let parentAction = this._selected?.parent;
    if (parentAction) {
      path.push(parentAction);
      while (parentAction) {
        const action = this._flatData.find((a) => a.id === parentAction);
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

  override connectedCallback() {
    super.connectedCallback();

    if (!this.noAutoLoadMdIcons){
      document.fonts.load("24px Material Icons", "apps").then(() => {});
    }

    this._registerInternalHotkeys();
  }

  private _flattern(members: INinjaAction[], parent?: string): INinjaAction[] {
    let children = [] as Array<any>;
    return members
      .map((mem) => {
        const alreadyFlatternByUser =
          mem.children &&
          mem.children.some((value: any) => {
            return typeof value == 'string';
          });
        const m = {...mem, parent: mem.parent || parent};
        if (alreadyFlatternByUser) {
          return m;
        } else {
          if (m.children && m.children.length) {
            parent = mem.id;
            children = [...children, ...m.children];
          }
          m.children = m.children ? m.children.map((c: any) => c.id) : [];
          return m;
        }
      })
      .concat(children.length ? this._flattern(children, parent) : children);
  }

  override update(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('data') && !this.disableHotkeys) {
      this._flatData = this._flattern(this.data);
      this._flatData
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

    this._actionMatches = this._flatData.filter((action) => {
      const regex = new RegExp(this._search, 'gi');
      const matcher =
        action.title.match(regex) || action.keywords?.match(regex);

      if (!this._currentRoot && this._search) {
        // global search for items on root
        return matcher;
      }

      return action.parent === this._currentRoot && matcher;
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
            .hotKeysJoinedView=${this.hotKeysJoinedView}
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
          <slot name="footer"> ${footerHtml} </slot>
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
