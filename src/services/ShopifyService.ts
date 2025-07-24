// Shopify service - handles API calls to Shopify
import axios from 'axios';
import { IShopifyService, ShopifyOrder } from '@/types';

export class ShopifyService implements IShopifyService {
  private readonly apiUrl: string;
  private readonly accessToken: string;

  constructor() {
    const store = process.env.SHOPIFY_STORE;
    const token = process.env.SHOPIFY_TOKEN;

    if (!store || !token) {
      throw new Error('Missing required Shopify environment variables: SHOPIFY_STORE and SHOPIFY_TOKEN');
    }

    this.apiUrl = `https://${store}/admin/api/2023-10`;
    this.accessToken = token;
  }

  /**
   * Fetch orders from Shopify
   */
  async fetchOrders(limit: number = 10): Promise<ShopifyOrder[]> {
    try {
      console.log(`🔄 Fetching up to ${limit} orders from Shopify...`);

      const response = await axios.get(`${this.apiUrl}/orders.json`, {
        params: { limit },
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        }
      });

      const orders: ShopifyOrder[] = response.data.orders || [];
      console.log(`📥 Found ${orders.length} orders from Shopify`);

      return orders;
    } catch (error) {
      console.error('❌ Error fetching orders from Shopify:');
      
      if (axios.isAxiosError(error) && error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Message: ${error.response.data?.errors || error.response.statusText}`);
        throw new Error(`Shopify API error: ${error.response.status} - ${error.response.statusText}`);
      } else {
        console.error(`   ${error}`);
        throw new Error(`Failed to fetch orders: ${error}`);
      }
    }
  }

  /**
   * Fetch a specific order by ID
   */
  async fetchOrderById(orderId: string): Promise<ShopifyOrder | null> {
    try {
      const response = await axios.get(`${this.apiUrl}/orders/${orderId}.json`, {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        }
      });

      return response.data.order || null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // Order not found
      }
      throw error;
    }
  }

  /**
   * Test the Shopify connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.apiUrl}/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': this.accessToken,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Connected to Shopify store: ${response.data.shop.name}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to Shopify:', error);
      return false;
    }
  }
}