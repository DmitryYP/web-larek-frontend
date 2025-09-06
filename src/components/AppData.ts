import { Model } from './base/Model';
import { IProduct, IUser, IAppState, FormErrors } from '../types';

export class AppState extends Model<IAppState> {
	catalog: IProduct[];
	user: IUser = {
		email: '',
		phone: '',
		address: '',
		payment: '',
		total: null,
		items: [],
	};;
	formErrors: FormErrors = {};

	setCatalog(items: IProduct[]) {
		this.catalog = items;
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	toggleOrderItem(id: string, isIncluded: boolean) {
		if (isIncluded) {
			if (!this.user.items.includes(id)) {
				this.user.items = [...this.user.items, id];
			}
		} else {
			this.user.items = this.user.items.filter((itemId) => itemId !== id);
		}

		this.emitChanges('basket:changed', { items: this.user.items });
	}

	clearBasket() {
		this.user.items = [];
		this.clearFields();
		this.emitChanges('basket:changed', { order: this.user });
	}

	getTotal():number {
		return (this.user.total = this.user.items.reduce(
			(a, c) => a + Number(this.catalog.find((it) => it.id === c)?.price || 0),
			0
		));
	}

	getCards(): IProduct[] {
		return this.catalog.filter((item) => this.user.items.includes(item.id));
	}

	isFilledFieldsAddress(): boolean {
		return !!this.user.address && !!this.user.payment;
	}

	isFilledFieldsContacts(): boolean {
		return !!this.user.email && !!this.user.phone;
	}

	clearFields() {
		this.user.email = '';
		this.user.address = '';
		this.user.payment = '';
		this.user.phone = '';
	}

	setField<K extends keyof IUser>(field: K, value: IUser[K]) {
    this.user[field] = value;

    if (['address', 'payment'].includes(field)) {
        this.validateAddress();
    }

    if (['email', 'phone'].includes(field)) {
        this.validateContacts();
    }
}


	setPaymentMethod(method: 'card' | 'cash' | '') {
		this.user.payment = method;
		this.validateAddress();
		this.emitChanges('payment:changed', { payment: method });
	}

	validateAddress(): boolean {
		const errors: FormErrors = {};
		if (!this.user.address) {
			errors.address = 'Необходимо указать адрес';
		}
		if (!this.user.payment) {
			errors.payment = 'Необходимо выбрать способ оплаты';
		}
		this.formErrors = errors;
		this.events.emit('form:errors', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateContacts(): boolean {
		const errors: FormErrors = {};
		if (!this.user.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.user.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.events.emit('form:errors', this.formErrors);
		return Object.keys(errors).length === 0;
	}
}