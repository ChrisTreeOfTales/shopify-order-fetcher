"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModel = void 0;
class OrderModel {
    constructor(db) {
        this.db = db;
    }
    /**
     * Create a new order
     */
    async create(shopifyOrder, customerId) {
        const result = await this.db.run(`INSERT INTO orders (shopify_order_id, customer_id, total_price, order_status, created_at) 
       VALUES (?, ?, ?, ?, ?)`, [
            shopifyOrder.id.toString(),
            customerId,
            parseFloat(shopifyOrder.total_price),
            shopifyOrder.financial_status,
            shopifyOrder.created_at
        ]);
        console.log(`   💾 Order saved to database (ID: ${result.id})`);
        return result.id;
    }
    /**
     * Check if order already exists
     */
    async exists(shopifyOrderId) {
        const existingOrder = await this.db.get('SELECT order_id FROM orders WHERE shopify_order_id = ?', [shopifyOrderId]);
        return !!existingOrder;
    }
    /**
     * Get all orders with summary information
     */
    async getAllSummaries() {
        return this.db.query(`
      SELECT 
        o.*,
        c.name as customer_name,
        c.email as customer_email,
        COUNT(oi.order_item_id) as total_items,
        SUM(oi.quantity) as total_quantity
      FROM orders o
      LEFT JOIN customers c ON o.customer_id = c.customer_id
      LEFT JOIN order_items oi ON o.order_id = oi.order_id
      GROUP BY o.order_id
      ORDER BY o.created_at DESC
    `);
    }
    /**
     * Get order by ID
     */
    async getById(orderId) {
        return this.db.get('SELECT * FROM orders WHERE order_id = ?', [orderId]);
    }
    /**
     * Get order by Shopify order ID
     */
    async getByShopifyId(shopifyOrderId) {
        return this.db.get('SELECT * FROM orders WHERE shopify_order_id = ?', [shopifyOrderId]);
    }
    /**
     * Update order status
     */
    async updateStatus(orderId, status) {
        await this.db.run('UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?', [status, orderId]);
    }
    /**
     * Mark order as completed
     */
    async markCompleted(orderId) {
        await this.db.run('UPDATE orders SET completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?', [orderId]);
    }
}
exports.OrderModel = OrderModel;
//# sourceMappingURL=Order.js.map