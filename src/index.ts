// ИМПОРТЫ
import './scss/styles.scss';
import { AppApi } from './components/AppApi';
import { CDN_URL, API_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { Page } from './components/View/Page';
import { IProduct, ICatalogChanged, IUser, FormErrors } from './types';
import { AppState } from './components/AppData';
import { ProductView } from './components/View/ProductView';
import { ensureElement, bem, cloneTemplate } from './utils/utils';
import { Modal } from './components/Modal';
import { Basket } from './components/View/BasketView';
import { BasketItem } from './components/View/BasketItem';
import { Order } from './components/View/Order';
import { Contacts } from './components/View/Contacts';
import { Success } from './components/View/Success';


// ТИМПЛЕЙТЫ И элементы DOM
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const modalContainer = ensureElement<HTMLTemplateElement>('#modal-container');


// ПЕРЕМЕННЫЕ
const events = new EventEmitter();
const api = new AppApi(CDN_URL, API_URL);
const appState = new AppState({}, events);
const page = new Page(document.body, events);
const modal = new Modal(modalContainer, events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Contacts(cloneTemplate(contactsTemplate), events);
const success = new Success(cloneTemplate(successTemplate), {  // Один раз призагрузке приложения
  onClick: () => {
    modal.close();
  },
});


// ФУНКЦИИ
function onOrderChange<K extends keyof IUser>(field: K, value: IUser[K]) {  // функция обработки изменения полей
  appState.setField(field, value);  // метод обновляющий состояние поля
  order.valid = appState.isFilledFieldsAddress();  // а это проверка валидации
}

function onContactsChange<K extends keyof IUser>(field: K, value: IUser[K]) {  // функция обработки изменения полей
  appState.setField(field, value);  // метод обновляющий состояние поля
  contacts.valid = appState.isFilledFieldsContacts();  // а это проверка валидации
}


// ИВЕНТЫ
events.onAll(({ eventName, data }) => { // Чтобы мониторить все события, для отладки
    console.log(eventName, data);
})


events.on<ICatalogChanged>('items:changed', () => {  // Это ивент каталога карточек. АХТУНГ! Каталог работает, отображается, к нему претензий быть не может. Если что-то не работает это только в нижеописанных ивентах
	page.catalog = appState.catalog.map((item) => {
		const product = new ProductView(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('item:select', item),
		});
		return product.render({
			id: item.id,
			title: item.title,
			image: item.image,
			price: item.price,
			category: item.category,
		});
	});
});


events.on('item:select', async (item: IProduct) => {  // Это событие связанное с карточкой товара, когда она выбрана. Открытие попапа со всеми кнопка и туда сюда. Если что-то в КАРТОЧКЕ не работает, проверить в первую очередь здесь
  if (!item) {
    modal.close();
    return;
  }
  try {
    const product = await api.getProduct(item.id); // получения данных о товаре по айди
    const card = new ProductView(cloneTemplate(cardPreviewTemplate), {
      onClick: () => {
        if (!card.isInBasket) { // проверяем наличие товара в корзине
          card.isInBasket = true; // меняем состояние карточки
          appState.toggleOrderItem(product.id, true); // меняем состояние корзины
        } else {
          events.emit('basket:open', product);  // если товар уже в корзине то срабатывает событие открытия корзины, которое описано чуть ниже
        }
      },
    });
    card.isInBasket = appState.user.items.includes(item.id); // далее просто рендерим карточку по айдишнику
    modal.render({
      content: card.render({
        title: product.title,
        image: product.image,
        description: product.description,
        price: product.price,
        category: product.category,
      }),
    });
  } catch (err) { // здесь ошибка в случае чего
    console.error(err);
  }
});


events.on('basket:open', () => {  // Событие открытия корзины. Корзина отображается всё ок. Здесь можно не искать.
	modal.render({
		content: basket.render(),
	});
});


events.on('basket:changed', () => {  // Событие ИЗМЕНЕНИЯ корзины
	const basketItems = appState.getCards();  // получаем список товаров
	page.counter = appState.user.items.length; // обновляем счётчик
	basket.total = appState.getTotal();  // обновляеми итоговую сумму корзины
	basket.selected = appState.user.items;  // обновляем список выбранных товаров
	basket.items = basketItems.map((item, i) => {  // создание нового массива методом map
		const basketItem = new BasketItem(cloneTemplate(cardBasketTemplate), {  // переменная для нашего тимплейта
			onClick: () => {
				appState.toggleOrderItem(item.id, false);  // удаляет товар из корзины
				events.emit('basket:changed');  // срабавает ивент
			},
		});
		return basketItem.render({ // рендерим по итогу...
			id: item.id,
			title: item.title,
			price: item.price,
			index: i + 1,  // ...включая порядковый номер
		});
	});
});


events.on('order:open', () => {  // инвент открытия формы заказа с адресом и типом оплаты
	appState.validateAddress();  // вызываем метод связанный с валидацей конкретной формы
	modal.render({  // и рендерим отрисовку модального окна со всеми данными
		content: order.render({
			address: appState.user.address,
			payment: appState.user.payment,
			validation: appState.isFilledFieldsAddress(),
			errors: [],
		}),
	});
});


events.on('order.payment:change', (data: { value: IUser['payment'] }) => {  // ивент изменения поля оплаты
  onOrderChange('payment', data.value);
});

events.on('order.address:change', (data: { value: IUser['address'] }) => { // ивент изменения поля адреса
  onOrderChange('address', data.value);
});


events.on('form:errors', (errors: FormErrors) => {  // Изменение состояния валидации формы
	const orderErrors = {  // переменная для конкретных ошибок
    payment: errors.payment,  // для способа оплаты
		address: errors.address,  // для адреса
	};
	order.valid = !orderErrors.address && !orderErrors.payment;  // true если нет ошибок
	order.errors = Object.values(orderErrors)  // собирает все ошибки в одну строку
		.filter((i) => !!i)
		.join('; ');
});


events.on('contacts:open', () => {  // ивент для открытия формы с контактами
	appState.validateContacts(); // вызываем метод связанный с валидацей конкретной формы
	modal.render({ // рендерим отрисовку модального окна со всеми данными
		content: contacts.render({
			email: appState.user.email,
			phone: appState.user.phone,
			validation: appState.isFilledFieldsContacts(),
			errors: [],
		}),
	});
});


events.on('contacts.email:change', (data: { value: IUser['email'] }) => {  // ивент изменения поля с почтой
  onContactsChange('email', data.value);
});

events.on('contacts.phone:change', (data: { value: IUser['phone'] }) => { // ивент изменения поля с телефоном
  onContactsChange('phone', data.value);
});

//Обработчик ошибок валидации формы контактов
events.on('form:errors', (errors: FormErrors) => { // Изменение состояния валидации формы. По аналогии с order
	const contactErrors = { // переменная для конкретных ошибок
		email: errors.email,  // для поля с почтой
		phone: errors.phone,  // для поля с телефоном
	};
	contacts.valid = !contactErrors.email && !contactErrors.phone;  // true если нет ошибок
	contacts.errors = Object.values(contactErrors)  // собирает оишбки в одну строку, всё по аналогии с order
		.filter((i) => !!i)
		.join('; ');
});


events.on('order:submit', () => {  // кнопка сабмита для перехода к форме контактов
	if (appState.validateAddress()) {
		events.emit('contacts:open');
	}
});


events.on('contacts:submit', () => {  // ивент после нажатия кнопки сабмита на форме контактов
	if (appState.validateContacts()) {  // сначала проверяем валидацию
		appState.getTotal();  // получаем итоговую сумму заказа
		api
			.createOrder(appState.user)  // создаём заказ
			.then((result) => {  // очищаем корзину сразу после успешного заказа
        appState.clearBasket();
        events.emit('basket:changed');
				modal.render({  // рендерим модальное окно с итоговой суммой заказа
					content: success.render({
						total: result.total,
					}),
				});
			})
			.catch((err) => {  // в случае чего ловим ошибку
				console.error(err);
				alert('Ошибка оформления заказа');
			});
	}
});


// Это ивенты связанные с прокруткой страницы и модальным окном.
// Блокируем прокрутку страницы если открыта модалка
events.on('modal:open', () => {
    page.locked = true;
});

// ... и разблокируем
events.on('modal:close', () => {
    page.locked = false;
});


// Это запрос с сервера
api
	.getCatalog()
	.then(appState.setCatalog.bind(appState))
	.catch((err) => {
		console.error(err);
	});