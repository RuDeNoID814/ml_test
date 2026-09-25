import type { Product } from '@/db/types';
import type { ProductRepository } from '../interfaces';

export class DexieProductRepository implements ProductRepository {
  add(_entry: Product): Promise<string> {
    throw new Error('not implemented');
  }
  get(_id: string): Promise<Product | null> {
    throw new Error('not implemented');
  }
  list(): Promise<Product[]> {
    throw new Error('not implemented');
  }
  update(_id: string, _patch: Partial<Product>): Promise<void> {
    throw new Error('not implemented');
  }
  delete(_id: string): Promise<void> {
    throw new Error('not implemented');
  }
  findByBarcode(_barcode: string): Promise<Product | null> {
    throw new Error('not implemented');
  }
  searchByName(_query: string): Promise<Product[]> {
    throw new Error('not implemented');
  }
}
