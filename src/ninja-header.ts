import {LitElement, html, css, TemplateResult} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ref, createRef} from 'lit/directives/ref.js';

@customElement('ninja-header')
export class NinjaHeader extends LitElement {
  static override styles = css`
    :host {
      flex: 1;
      position: relative;
    }
    .search {
      padding: 20px;
      flex-grow: 1;
      flex-shrink: 0;
      margin: 0px;
      border: none;
      appearance: none;
      font-size: 18px;
      background: transparent;
      color: rgb(60, 65, 73);
      caret-color: rgb(110, 94, 210);
      outline: none;
    }
    .breadcrumb-list {
      padding: 16px 64px 0px 16px;
      display: flex;
      flex-direction: row;
      align-items: stretch;
      justify-content: flex-start;
      flex: initial;
    }

    .breadcrumb {
      background: rgb(239, 241, 244);
      height: 20px;
      text-align: center;
      line-height: 20px;
      border-radius: 4px;
      border: 0;
      cursor: pointer;
      font-size: 12px;
      padding: 0 8px;
      color: rgb(107, 111, 118);
      margin-right: 8px;
    }

    .search-wrapper {
      display: flex;
      border-bottom: 1px solid rgb(239, 241, 244);
    }
  `;

  @property()
  placeholder = '';

  @property({type: Boolean})
  hideBreadcrumbs = false;

  @property()
  breadcrumbHome = 'Home';

  @property({type: Array})
  breadcrumbs: string[] = [];

  private _inputRef = createRef<HTMLInputElement>();

  override render() {
    let breadcrumbs: TemplateResult<1> | '' = '';
    if (!this.hideBreadcrumbs) {
      const itemTemplates = [];
      for (const breadcrumb of this.breadcrumbs) {
        itemTemplates.push(
          html`<button
            @click=${() => this.selectParent(breadcrumb)}
            class="breadcrumb"
          >
            ${breadcrumb}
          </button>`
        );
      }
      breadcrumbs = html`<div class="breadcrumb-list">
        <button @click=${() => this.selectParent()} class="breadcrumb">
          ${this.breadcrumbHome}
        </button>
        ${itemTemplates}
      </div>`;
    }

    return html`
      ${breadcrumbs}
      <div class="search-wrapper">
        <input
          type="text"
          id="search"
          spellcheck="false"
          autocomplete="off"
          @input="${this._handleInput}"
          ${ref(this._inputRef)}
          placeholder="${this.placeholder}"
          class="search"
        />
      </div>
    `;
  }

  setSearch(value: string) {
    if (this._inputRef.value) {
      this._inputRef.value.value = value;
    }
  }

  focusSearch() {
    requestAnimationFrame(() => this._inputRef.value!.focus());
  }

  private _handleInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {search: input.value},
        bubbles: true,
        composed: true,
      })
    );
  }

  private selectParent(breadcrumb?: string) {
    this.dispatchEvent(
      new CustomEvent('setParent', {
        detail: {parent: breadcrumb},
        bubbles: true,
        composed: true,
      })
    );
  }

  override firstUpdated() {
    this.focusSearch();
  }

  _close() {
    this.dispatchEvent(
      new CustomEvent('close', {bubbles: true, composed: true})
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ninja-header': NinjaHeader;
  }
}
