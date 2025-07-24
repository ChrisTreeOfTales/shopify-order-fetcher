// Customer model for database operations
import { Customer, ShopifyCustomer, IDatabaseService } from '@/types';

export class CustomerModel {
  constructor(private db: IDatabaseService) {}

  /**
   * Create a new customer or update existing one
   */
  async createOrUpdate(shopifyCustomer: ShopifyCustomer | null): Promise<number | null> {
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
      const existingCustomer = await this.db.get<Customer>(
        'SELECT customer_id, number_of_orders FROM customers WHERE email = ?',
        [email]
      );

      if (existingCustomer) {
        // Update order count
        await this.db.run(
          'UPDATE customers SET number_of_orders = number_of_orders + 1 WHERE customer_id = ?',
          [existingCustomer.customer_id]
        );
        console.log(`   📊 Updated customer order count: ${existingCustomer.number_of_orders + 1}`);
        return existingCustomer.customer_id;
      } else {
        // Create new customer
        const result = await this.db.run(
          'INSERT INTO customers (name, email, number_of_orders) VALUES (?, ?, 1)',
          [customerName, email]
        );
        console.log(`   👤 New customer created: ${customerName}`);
        return result.id;
      }
    } catch (error) {
      console.error('❌ Error saving customer:', error);
      return null;
    }
  }

  /**
   * Get customer by ID
   */
  async getById(customerId: number): Promise<Customer | undefined> {
    return this.db.get<Customer>(
      'SELECT * FROM customers WHERE customer_id = ?',
      [customerId]
    );
  }

  /**
   * Get all customers
   */
  async getAll(): Promise<Customer[]> {
    return this.db.query<Customer>(
      'SELECT * FROM customers ORDER BY created_at DESC'
    );
  }

  /**
   * Get customer by email
   */
  async getByEmail(email: string): Promise<Customer | undefined> {
    return this.db.get<Customer>(
      'SELECT * FROM customers WHERE email = ?',
      [email]
    );
  }
}