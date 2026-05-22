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

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  altPhone?: string;
  address: string;
  district: string;
  thana: string;
  notes?: string;
  paymentMethod: string;
}

export interface Order {
  id: string;
  customerInfo: OrderCustomerInfo;
  items: CartItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: 'Pending' | 'Confirmed' | 'Processing' | 'Ready to Ship' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: number;
}
