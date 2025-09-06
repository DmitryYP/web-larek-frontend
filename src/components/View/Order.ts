import { IFormAddress } from "../../types";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";
import { Form } from "./Form";

export class Order extends Form<IFormAddress> {
  protected _buttonCash: HTMLButtonElement;
  protected _buttonCard: HTMLButtonElement;

  constructor(container: HTMLFormElement, events: IEvents) {
    super(container, events);

    this._buttonCash = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
    this._buttonCard = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
    // Обработчики для кнопок способа оплаты
    this._buttonCash.addEventListener('click', () => {
      this.toggleClass(this._buttonCash, 'button_alt-active', true);
      this.toggleClass(this._buttonCard, 'button_alt-active', false);
      this.paymentChange('cash');
    });

    this._buttonCard.addEventListener('click', () => {
      this.toggleClass(this._buttonCard, 'button_alt-active', true);
      this.toggleClass(this._buttonCash, 'button_alt-active', false);
      this.paymentChange('card');
    });
  }
  protected paymentChange(value: string) {
    this.events.emit('order.payment:change', {
      field: 'payment',
      value: value,
    });
  }

  set address(value: string) {
    (this.container.elements.namedItem('address') as HTMLInputElement).value =
      value;
  }
  //метод для установки способа оплаты
  set payment(value: string) {
    if (value === 'cash') {
      this.toggleClass(this._buttonCash, 'button_alt-active', true);
      this.toggleClass(this._buttonCard, 'button_alt-active', false);
    } else if (value === 'card') {
      this.toggleClass(this._buttonCard, 'button_alt-active', true);
      this.toggleClass(this._buttonCash, 'button_alt-active', false);
    }
  }
}