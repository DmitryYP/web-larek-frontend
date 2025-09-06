// ГЛАВНАЯ СТРАНИЦА(!)
import { Component } from '../base/Component';
import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';
import { IPage } from '../../types';

export class Page extends Component<IPage> {
	protected _catalog: HTMLElement;
	protected _basketCounter: HTMLElement;
	protected _wrapper: HTMLElement;
	protected _basketButton: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._catalog = ensureElement<HTMLElement>('.gallery', this.container);
		this._basketCounter = ensureElement<HTMLElement>(
			'.header__basket-counter',
			this.container
		);
		this._wrapper = ensureElement<HTMLElement>(
			'.page__wrapper',
			this.container
		);
		this._basketButton = ensureElement<HTMLElement>(
			'.header__basket',
			this.container
		);

		this._basketButton.addEventListener('click', () =>
			this.events.emit('basket:open')
		);
	}

	set counter(value: number) {
		this.setText(this._basketCounter, String(value));
	}

	set catalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items);
	}

	set locked(value: boolean) {
		if (value) {
			this._wrapper.classList.add('page__wrapper_locked');
		} else {
			this._wrapper.classList.remove('page__wrapper_locked');
		}
	}
}