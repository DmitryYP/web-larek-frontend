import { IEvents } from "../components/base/events";

export interface IProduct {  //Товар
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number;
  index?: number;
}

export interface IUser {  // Пользователь
  payment: 'card' | 'cash' | '';
  address: string;
  email: string;
  phone: string;
  events?: IEvents;
  total?: number | null;
  items?: string[]
}


export type IBasket = Pick<IUser, 'items' | 'total' | 'events'>;

export type IFormAddress = Pick<IUser, 'payment' | 'address'>;  // Попап оплата/адрес

export type IFormContacts = Pick<IUser, 'email' | 'phone'>;  // Попап почта/телефон

export type IFormSuccess = Pick<IBasket, 'total'>;  // Попап итоговый

export interface IAppState {  // Интерфейс связанный с валидацией и ошибками (использую в AppData)
	validation?: boolean;
	errors?: string[];
}

export interface IPage {  // Интерфейс для отображения каталога
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

export interface IOrderResponse { // Интерфейс ответа сервера при успешном заказе
  id: string;
  total: number;
}

export interface ICatalogChanged {  // изменение каталога
  catalog: IProduct[];
}

export interface IAppApi { // Интерфейс методов для работы с апи
  getCatalog(): Promise<IProduct[]>;  // гет запрос на каталог
  getProduct(id: string): Promise<IProduct>;  // гет запрос на товар
  createOrder(order: IUser): Promise<IOrderResponse>;  // это пост запрос на создание заказа(!)
}

export type FormErrors = Partial<Record<keyof IUser, string>>;  