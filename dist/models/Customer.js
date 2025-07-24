"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerModel = void 0;
class CustomerModel {
    constructor(db) {
        this.db = db;
    }
    /**
     * Create a new customer or update existing one
     */
    async createOrUpdate(shopifyCustomer) {
        if (!shopifyCustomer) {
            return null; // Handle guest orders
        }
        const customerName = `${shopifyCustomer.first_name || ''} ${shopifyCustomer.last_name || ''}`.trim();
        const email = shopifyCustomer.email;
        if (!email) {
            return null;
        }
        try {
            // Check if customer already exists
            const existingCustomer = await this.db.get('SELECT customer_id, number_of_orders FROM customers WHERE email = ?', [email]);
            if (existingCustomer) {
                // Update order count
                await this.db.run('UPDATE customers SET number_of_orders = number_of_orders + 1 WHERE customer_id = ?', [existingCustomer.customer_id]);
                console.log(`   📊 Updated customer order count: ${existingCustomer.number_of_orders + 1}`);
                return existingCustomer.customer_id;
            }
            else {
                // Create new customer
                const result = await this.db.run('INSERT INTO customers (name, email, number_of_orders) VALUES (?, ?, 1)', [customerName, email]);
                console.log(`   👤 New customer created: ${customerName}`);
                return result.id;
            }
        }
        catch (error) {
            console.error('❌ Error saving customer:', error);
            return null;
        }
    }
    /**
     * Get customer by ID
     */
    async getById(customerId) {
        return this.db.get('SELECT * FROM customers WHERE customer_id = ?', [customerId]);
    }
    /**
     * Get all customers
     */
    async getAll() {
        return this.db.query('SELECT * FROM customers ORDER BY created_at DESC');
    }
    /**
     * Get customer by email
     */
    async getByEmail(email) {
        return this.db.get('SELECT * FROM customers WHERE email = ?', [email]);
    }
}
exports.CustomerModel = CustomerModel;
//# sourceMappingURL=Customer.js.map