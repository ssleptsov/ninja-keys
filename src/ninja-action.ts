import {LitElement, html, css} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {INinjaAction} from './interfaces/ininja-action';
import {classMap} from 'lit/directives/class-map.js';
import '@material/mwc-icon';

@customElement('ninja-action')
export class NinjaAction extends LitElement {
  static override styles = css`
    :host {
      display: flex;
    }
    .ninja-action {
      padding: 12px 16px;
      display: flex;
      border-left: 2px solid rgb(110, 121, 214, 0);
      align-items: center;
      justify-content: start;
      font-size: 13px;
      outline: none;
      transition: color 0s ease 0s;
    }
    .ninja-action.selected {
      cursor: pointer;
      background-color: rgb(248, 249, 251);
      border-left: 2px solid rgb(110, 121, 214);
      outline: none;
    }
    slot {
      display: flex;
      width: 100%;
    }
    .ninja-icon {
      font-size: 20px;
      margin-right: 16px;
      color: rgb(107, 111, 118);
      margin-right: 16px;
      width: 20px;
      height: 20px;
      position: relative;
    }
    .ninja-title {
      flex-shrink: 0.01;
      margin-right: 8px;
      flex-grow: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .ninja-hotkeys {
      margin-left: 8px;
      flex-shrink: 0;
      width: min-content;
    }

    .ninja-hotkey {
      background: rgb(239, 241, 244);
      padding: 1px 4px;
      border-radius: 3px;
      min-width: 20px;
      text-transform: capitalize;
      color: rgb(60, 65, 73);
      font-size: 12px;
    }
  `;

  @property({type: Object})
  action!: INinjaAction;

  @property({type: Boolean})
  selected = false;

  /**
   * Scroll to show element
   */
  ensureInView() {
    requestAnimationFrame(() => this.scrollIntoView({block: 'nearest'}));
  }

  override click() {
    this.dispatchEvent(
      new CustomEvent('actionsSelected', {
        detail: this.action,
        bubbles: true,
        composed: true,
      })
    );
  }

  constructor() {
    super();
    this.addEventListener('click', this.click);
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('selected')) {
      if (this.selected) {
        this.ensureInView();
      }
    }
  }

  override render() {
    const icon = this.action.icon
      ? html`<mwc-icon class="ninja-icon">${this.action.icon}</mwc-icon>`
      : html`<div class="ninja-icon"></div>`;

    const hotkey = this.action.hotkey
      ? html`<div class="ninja-hotkey">${this.action.hotkey}</div>`
      : '';

    const classes = {
      selected: this.selected,
      'ninja-action': true,
    };

    return html`
      <slot class="ninja-action" class=${classMap(classes)}>
        ${icon}
        <div class="ninja-title">${this.action.title}</div>
        ${hotkey}
      </slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ninja-action': NinjaAction;
  }
}
