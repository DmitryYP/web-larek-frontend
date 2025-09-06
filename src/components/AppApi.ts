import { Api, ApiListResponse } from "./base/api";
import { IProduct, IUser, IOrderResponse, IAppApi } from "../types";

export class AppApi extends Api implements IAppApi {
  readonly cdn: string;

  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
    super(baseUrl, options);
    this.cdn = cdn;
  }

  getCatalog(): Promise<IProduct[]> {  // Получение каталога
    return this.get('/product').then(
      (data: ApiListResponse<IProduct>) =>
        data.items.map(item => ({
          ...item,
          image: this.cdn + item.image,
        }))
    );
  }

  getProduct(id: string): Promise<IProduct> {  // Получение карточки по id
		return this.get(`/product/${id}`).then((item: IProduct) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

  createOrder(order: IUser): Promise<IOrderResponse> {  // Создание заказа
    return this.post('/order', order, 'POST').then(
      (res: IOrderResponse) => res
    );
  }
}