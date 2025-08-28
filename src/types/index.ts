export interface IProduct {  //Товар
  id: string;
  description: string;
  images: string;
  title: string;
  category: string;
  price: number;
}

export interface IUser {  // Пользователь
  payment: 'card' | 'cash' | '';
  address: string;
  email: string;
  phone: string;
}

export interface IBasket {  // Корзина
  items: IProduct[];
  total: number | null;
}

export interface IProductData {  // Отображение всех товаров
	items: IProduct[];
  preview: string | null;
 }



export type FormAddress = Pick<IUser, 'payment' | 'address'>;  // Попап оплата/адрес

export type FormContacts = Pick<IUser, 'email' | 'phone'>;  // Попап почта/телефон

export type FormSuccess = Pick<IBasket, 'total'>;  // Попап итоговый
