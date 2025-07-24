// Product model for database operations
import { Product, IDatabaseService } from '@/types';

export class ProductModel {
  constructor(private db: IDatabaseService) {}

  /**
   * Get product by SKU
   */
  async getBySku(sku: string): Promise<Product | undefined> {
    return this.db.get<Product>(
      'SELECT * FROM products WHERE sku = ?',
      [sku]
    );
  }

  /**
   * Get all products
   */
  async getAll(): Promise<Product[]> {
    return this.db.query<Product>(
      'SELECT * FROM products ORDER BY product_name ASC'
    );
  }

  /**
   * Create a new product
   */
  async create(productData: Omit<Product, 'product_id'>): Promise<number> {
    const result = await this.db.run(
      `INSERT INTO products (product_name, category, number_of_printing_plates, box_size, sku) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        productData.product_name,
        productData.category,
        productData.number_of_printing_plates,
        productData.box_size,
        productData.sku
      ]
    );
    return result.id;
  }

  /**
   * Update product printing plate requirements
   */
  async updatePlateCount(productId: number, plateCount: number): Promise<void> {
    await this.db.run(
      'UPDATE products SET number_of_printing_plates = ? WHERE product_id = ?',
      [plateCount, productId]
    );
  }

  /**
   * Get product with plate count by SKU
   */
  async getPlateRequirementBySku(sku: string): Promise<{ product_id: number; number_of_printing_plates: number; product_name: string } | undefined> {
    return this.db.get<{ product_id: number; number_of_printing_plates: number; product_name: string }>(
      'SELECT product_id, number_of_printing_plates, product_name FROM products WHERE sku = ?',
      [sku]
    );
  }
}