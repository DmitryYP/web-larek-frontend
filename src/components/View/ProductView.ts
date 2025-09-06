import { Component } from '../base/Component';
import { ensureElement, bem } from '../../utils/utils';
import { IProduct } from '../../types';
import { modifierMap } from '../base/CategoryProduct';

export class ProductView extends Component<IProduct> {
  protected _title: HTMLElement;
  protected _price: HTMLElement;
  protected _button?: HTMLButtonElement;
  protected _isInBasket: boolean = false;
  protected _image?: HTMLImageElement;
  protected _category?: HTMLElement;
  protected _description?: HTMLElement;

  constructor(container: HTMLElement, actions?: { onClick: (event: MouseEvent) => void }) {
    super(container);
    this._title = ensureElement<HTMLElement>('.card__title', container);  // Инициализщация элементов из DOM
    this._price = ensureElement<HTMLElement>('.card__price', container);
    this._button = container.querySelector('.card__button');
    this._image = container.querySelector('.card__image');
    this._category = container.querySelector('.card__category');
    this._description = container.querySelector('.card__text');

    // Обработка действия по клику
    if (actions?.onClick) {
      if (this._button) {
        this._button.addEventListener('click', actions.onClick);
      } else {
        container.addEventListener('click', actions.onClick);
      }
    }
    if (this._button) {  // Кнопка в состоянии по умолчанию
      this.setText(this._button, 'Купить');
    }
  }

  // Геттер и сеттер для id
  set id(value: string) {  // установка карточки по айди
    this.container.dataset.id = value;
  }
  get id(): string {   // получение карточки по айди
    return this.container.dataset.id || '';
  }

  set title(value: string) {  // установка заголовка карточки
    this.setText(this._title, value);
  }

  set price(value: number | null) {  // установка цены с вариантом null если бесценно!
    if (value === null || isNaN(value)) {
      this.setText(this._price, 'Бесценно');
      this.toggleButton(true);  // в случае бесценно блокируем кнопку
      this.setText(this._button, 'Недоступно');  // в случае если какая-то канифоль с кнопкой посмотреть сюда для начала
    } else {
      this.setText(this._price, `${value} синапсов`);
      this.toggleButton(false);  // в остальных случаях кнопка активна
    }
  }

  set buttonText(value: string) {  //  это сеттер текста для кноки
    if (this._button) {
      this.setText(this._button, value);
    }
  }

  get isInBasket(): boolean {  // получение корзины
    return this._isInBasket;
  }

  set isInBasket(value: boolean) {  // обновление текста кнопки в зависимости от статуса
    this._isInBasket = value;
    this.buttonText = value ? 'В корзину' : 'Купить';
  }

  toggleButton(state: boolean) {  // включение и выключение кнопки
    this.setDisabled(this._button, state);
  }

  set description(value: string | string[]) {  // установка описания товара
    if (!this._description) return;
    if (Array.isArray(value)) {  // если это массив то...
      this._description.replaceWith(
        ...value.map((str) => {
          const descTemplate = this._description!.cloneNode() as HTMLElement;
          this.setText(descTemplate, str);
          return descTemplate;
        })
      );
    } else {  // в остальных случаях... (остальные случаи подразумевается один элемент)
      this.setText(this._description, value);
    }
  }

  set category(value: string) {  // установка категории товара
    if (!this._category) return;

    const modifier = modifierMap[value];  // преобразование на всякий случай
    if (!modifier) return;

    const className = bem('card', 'category', modifier).name;
    this.setText(this._category, value);
    this.toggleClass(this._category, className, true);
}

  set image(value: string) {  // установка изображения
    if (this._image) {
      this.setImage(this._image, value);
    }
  }
}