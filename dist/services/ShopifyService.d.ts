import { IShopifyService, ShopifyOrder } from '@/types';
export declare class ShopifyService implements IShopifyService {
    private readonly apiUrl;
    private readonly accessToken;
    constructor();
    /**
     * Fetch orders from Shopify
     */
    fetchOrders(limit?: number): Promise<ShopifyOrder[]>;
    /**
     * Fetch a specific order by ID
     */
    fetchOrderById(orderId: string): Promise<ShopifyOrder | null>;
    /**
     * Test the Shopify connection
     */
    testConnection(): Promise<boolean>;
}
//# sourceMappingURL=ShopifyService.d.ts.map