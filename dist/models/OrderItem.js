"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderItemModel = void 0;
class OrderItemModel {
    constructor(db) {
        this.db = db;
    }
    /**
     * Create order items for an order
     */
    async create(lineItem, orderId, customerId, productId) {
        // Extract variant details
        const variantDetails = [];
        if (lineItem.properties && lineItem.properties.length > 0) {
            lineItem.properties.forEach(prop => {
                if (!prop.name.startsWith('_mws')) {
                    variantDetails.push(`${prop.name}: ${prop.value}`);
                }
            });
        }
        // Also check for the variant options directly
        if (lineItem.variant_option1)
            variantDetails.push(`Option 1: ${lineItem.variant_option1}`);
        if (lineItem.variant_option2)
            variantDetails.push(`Option 2: ${lineItem.variant_option2}`);
        if (lineItem.variant_option3)
            variantDetails.push(`Option 3: ${lineItem.variant_option3}`);
        const result = await this.db.run(`INSERT INTO order_items (order_id, customer_id, product_id, product_name, quantity, price, variant_title, variant_details, sku) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            orderId,
            customerId,
            productId,
            lineItem.title,
            lineItem.quantity,
            parseFloat(lineItem.price),
            lineItem.variant_title || null,
            variantDetails.join('|'),
            lineItem.sku || null
        ]);
        console.log(`   📦 Order item saved: ${lineItem.title} (ID: ${result.id})`);
        return result.id;
    }
    /**
     * Get order items with detailed information including printing plate status
     */
    async getDetailsByOrderId(orderId) {
        return this.db.query(`
      SELECT 
        oi.*,
        c.name as customer_name,
        COUNT(pp.plate_id) as total_plates,
        SUM(CASE WHEN pp.status = 'In Queue' THEN 1 ELSE 0 END) as plates_in_queue,
        SUM(CASE WHEN pp.status = 'In Progress' THEN 1 ELSE 0 END) as plates_in_progress,
        SUM(CASE WHEN pp.status = 'Printed' THEN 1 ELSE 0 END) as plates_printed,
        SUM(CASE WHEN pp.status = 'Done' THEN 1 ELSE 0 END) as plates_done,
        SUM(CASE WHEN pp.status = 'Blocked' THEN 1 ELSE 0 END) as plates_blocked
      FROM order_items oi
      LEFT JOIN customers c ON oi.customer_id = c.customer_id
      LEFT JOIN printing_plates pp ON oi.order_item_id = pp.order_item_id
      WHERE oi.order_id = ?
      GROUP BY oi.order_item_id
      ORDER BY oi.created_at ASC
    `, [orderId]);
    }
    /**
     * Get all order items
     */
    async getAll() {
        return this.db.query('SELECT * FROM order_items ORDER BY created_at DESC');
    }
    /**
     * Get order item by ID
     */
    async getById(orderItemId) {
        return this.db.get('SELECT * FROM order_items WHERE order_item_id = ?', [orderItemId]);
    }
    /**
     * Update order item completion status
     */
    async markCompleted(orderItemId) {
        await this.db.run('UPDATE order_items SET completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE order_item_id = ?', [orderItemId]);
    }
    /**
     * Get order items by product SKU
     */
    async getBySku(sku) {
        return this.db.query('SELECT * FROM order_items WHERE sku = ? ORDER BY created_at DESC', [sku]);
    }
}
exports.OrderItemModel = OrderItemModel;
//# sourceMappingURL=OrderItem.js.map