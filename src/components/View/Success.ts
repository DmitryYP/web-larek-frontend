import { IFormSuccess } from "../../types";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";

export class Success extends Component<IFormSuccess> {
  protected _close: HTMLElement;
  protected _total: HTMLElement;

  constructor(container: HTMLElement, actions: { onClick: (event: MouseEvent) => void }) {
    super(container);

    this._close = ensureElement<HTMLElement>(
      '.order-success__close',
      this.container
    );
    this._total = ensureElement<HTMLElement>(
      '.order-success__description',
      this.container
    );

    if (actions?.onClick) {
      this._close.addEventListener('click', actions.onClick);
    }
  }
  set total(total: number) {
    let currentText;
    if (total === 1) {
      currentText = 'синапс';
    } else if (total >= 2 && total < 5) {
      currentText = 'синапса';
    } else {
      currentText = 'синапсов';
    }

    this.setText(this._total, `Списано ${total} ${currentText}`);
  }
}