export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  regularPrice: number;
  salePrice: number;
  availability: 'In Stock' | 'Pre Order' | 'Upcoming';
  imageUrl: string;
  createdAt: number;
}

export interface OfflineSale {
  id: string;
  brand: string;
  itemName: string;
  unit: 'KG' | 'Bag' | 'Piece' | 'Pft' | 'Ton';
  qty: number;
  unitPrice: number;
  total: number;
  timestamp: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OnlineOrder {
  id: string;
  items: CartItem[];
  total: number;
  status: 'Pending' | 'Completed';
  timestamp: number;
  gateway: string;
  customerName: string;
  phone: string;
}
