
export interface SizeVariation {
  id: string;
  size: string;
  quantity: number;
}

export interface ColorVariation {
  id: string;
  color: string;
  sizes: SizeVariation[];
}

export interface Product {
  id: string;
  name: string;
  variations: ColorVariation[];
}

export enum TransactionType {
  IN = 'Stock In',
  OUT = 'Stock Out',
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  type: TransactionType;
  date: string; // ISO string
}
