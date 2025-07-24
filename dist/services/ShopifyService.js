"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyService = void 0;
// Shopify service - handles API calls to Shopify
const axios_1 = __importDefault(require("axios"));
class ShopifyService {
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
    async fetchOrders(limit = 10) {
        try {
            console.log(`🔄 Fetching up to ${limit} orders from Shopify...`);
            const response = await axios_1.default.get(`${this.apiUrl}/orders.json`, {
                params: { limit },
                headers: {
                    'X-Shopify-Access-Token': this.accessToken,
                    'Content-Type': 'application/json'
                }
            });
            const orders = response.data.orders || [];
            console.log(`📥 Found ${orders.length} orders from Shopify`);
            return orders;
        }
        catch (error) {
            console.error('❌ Error fetching orders from Shopify:');
            if (axios_1.default.isAxiosError(error) && error.response) {
                console.error(`   Status: ${error.response.status}`);
                console.error(`   Message: ${error.response.data?.errors || error.response.statusText}`);
                throw new Error(`Shopify API error: ${error.response.status} - ${error.response.statusText}`);
            }
            else {
                console.error(`   ${error}`);
                throw new Error(`Failed to fetch orders: ${error}`);
            }
        }
    }
    /**
     * Fetch a specific order by ID
     */
    async fetchOrderById(orderId) {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/orders/${orderId}.json`, {
                headers: {
                    'X-Shopify-Access-Token': this.accessToken,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.order || null;
        }
        catch (error) {
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                return null; // Order not found
            }
            throw error;
        }
    }
    /**
     * Test the Shopify connection
     */
    async testConnection() {
        try {
            const response = await axios_1.default.get(`${this.apiUrl}/shop.json`, {
                headers: {
                    'X-Shopify-Access-Token': this.accessToken,
                    'Content-Type': 'application/json'
                }
            });
            console.log(`✅ Connected to Shopify store: ${response.data.shop.name}`);
            return true;
        }
        catch (error) {
            console.error('❌ Failed to connect to Shopify:', error);
            return false;
        }
    }
}
exports.ShopifyService = ShopifyService;
//# sourceMappingURL=ShopifyService.js.map