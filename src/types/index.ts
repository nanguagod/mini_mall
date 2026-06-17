export type CartItemWithProduct = {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    slug: string;
    stock: number;
  };
};

export type OrderWithItems = {
  id: number;
  userId: number;
  status: string;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: number;
    quantity: number;
    price: number;
    product: {
      name: string;
      imageUrl: string;
    };
  }[];
};
