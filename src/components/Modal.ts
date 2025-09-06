import { ensureElement } from "../utils/utils";
import { Component } from "./base/Component";
import { IEvents } from "./base/events";

export interface IModalData {
  content: HTMLElement;
}

export class Modal extends Component<IModalData> {
  protected _closeButton: HTMLButtonElement;
  protected _content: HTMLElement;
  protected events: IEvents;

  constructor(container: HTMLElement, events: IEvents) {
    super(container);
    this.events = events;
    this._closeButton = ensureElement<HTMLButtonElement>(
      '.modal__close',
      container
    );
    this._content = ensureElement<HTMLElement>('.modal__content', container);

    this.container.addEventListener('click', this.close.bind(this));
    this._content.addEventListener('click', (event) => event.stopPropagation());
    this.container.addEventListener('click', (event) => {
      if (event.target === this.container) {
        this.close();
      }
    });
  }

  _toggleModal(state: boolean = true) {
    this.toggleClass(this.container, 'modal_active', state);
  }

  _handleEscape = (evt: KeyboardEvent) => {
    if (evt.key === 'Escape') {
      this.close();
    }
  };

  set content(value: HTMLElement) {
    this._content.replaceChildren(value);
  }

  open() {
    this._toggleModal();
    document.addEventListener('keydown', this._handleEscape);
    this.events.emit('modal:open');
  }

  close() {
    this._toggleModal(false);
    document.removeEventListener('keydown', this._handleEscape);
    this.content = null;
    this.events.emit('modal:close');
  }

  render(data: IModalData): HTMLElement {
    super.render(data);
    this.open();
    return this.container;
  }
}