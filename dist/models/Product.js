"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModel = void 0;
class ProductModel {
    constructor(db) {
        this.db = db;
    }
    /**
     * Get product by SKU
     */
    async getBySku(sku) {
        return this.db.get('SELECT * FROM products WHERE sku = ?', [sku]);
    }
    /**
     * Get all products
     */
    async getAll() {
        return this.db.query('SELECT * FROM products ORDER BY product_name ASC');
    }
    /**
     * Create a new product
     */
    async create(productData) {
        const result = await this.db.run(`INSERT INTO products (product_name, category, number_of_printing_plates, box_size, sku) 
       VALUES (?, ?, ?, ?, ?)`, [
            productData.product_name,
            productData.category,
            productData.number_of_printing_plates,
            productData.box_size,
            productData.sku
        ]);
        return result.id;
    }
    /**
     * Update product printing plate requirements
     */
    async updatePlateCount(productId, plateCount) {
        await this.db.run('UPDATE products SET number_of_printing_plates = ? WHERE product_id = ?', [plateCount, productId]);
    }
    /**
     * Get product with plate count by SKU
     */
    async getPlateRequirementBySku(sku) {
        return this.db.get('SELECT product_id, number_of_printing_plates, product_name FROM products WHERE sku = ?', [sku]);
    }
}
exports.ProductModel = ProductModel;
//# sourceMappingURL=Product.js.map