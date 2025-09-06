import { ensureElement } from "../../utils/utils";
import { ProductView } from "./ProductView";
export interface IBasketItem {
	index: number;
	id: string;
	title: string;
	price: number;
}
export class BasketItem extends ProductView {  // добавлять в <> нет нужды так как здесь уже стоит IProduct
  protected _index: HTMLElement;  // порядковый номер товара в корзине, добавил в интерфейс
  protected _buttonDelete: HTMLButtonElement;  // кнопка удаления товара из корзины

  constructor(container: HTMLElement, actions?: { onClick: (event: MouseEvent) => void }) {
    super(container, actions);
    this._index = ensureElement<HTMLElement>('.basket__item-index', container); // находим индекс
    this._buttonDelete = ensureElement<HTMLButtonElement>(  // находим кнопку
      '.basket__item-delete',
      container
    );
    if (actions?.onClick) {
      this._buttonDelete.addEventListener('click', actions.onClick);  // слушатель на кнопку
    }
      this._buttonDelete.textContent = '';  // очищаем текст у кнопки удаления, то бишь "купить"
  }

  set index(value: number) {  // отображение порядкого номера в корзине
    this.setText(this._index, value);
  }
}