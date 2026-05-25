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
  unit: string;
  qty: number;
  unitPrice: number;
  total: number;
  timestamp: number;
  customerName?: string;
  customerPhone?: string;
  customerLocation?: string;
  deliveryHand?: string;
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
  userId?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface Qa {
  id: string;
  productId: string;
  question: string;
  askedBy: string;
  askedById: string;
  createdAt: number;
  answer?: string;
  answeredBy?: string;
  answeredAt?: number;
}

