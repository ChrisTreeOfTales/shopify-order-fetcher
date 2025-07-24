import { Product, IDatabaseService } from '@/types';
export declare class ProductModel {
    private db;
    constructor(db: IDatabaseService);
    /**
     * Get product by SKU
     */
    getBySku(sku: string): Promise<Product | undefined>;
    /**
     * Get all products
     */
    getAll(): Promise<Product[]>;
    /**
     * Create a new product
     */
    create(productData: Omit<Product, 'product_id'>): Promise<number>;
    /**
     * Update product printing plate requirements
     */
    updatePlateCount(productId: number, plateCount: number): Promise<void>;
    /**
     * Get product with plate count by SKU
     */
    getPlateRequirementBySku(sku: string): Promise<{
        product_id: number;
        number_of_printing_plates: number;
        product_name: string;
    } | undefined>;
}
//# sourceMappingURL=Product.d.ts.map