import { Order, OrderSummaryDTO, ShopifyOrder, IDatabaseService } from '@/types';
export declare class OrderModel {
    private db;
    constructor(db: IDatabaseService);
    /**
     * Create a new order
     */
    create(shopifyOrder: ShopifyOrder, customerId: number | null): Promise<number>;
    /**
     * Check if order already exists
     */
    exists(shopifyOrderId: string): Promise<boolean>;
    /**
     * Get all orders with summary information
     */
    getAllSummaries(): Promise<OrderSummaryDTO[]>;
    /**
     * Get order by ID
     */
    getById(orderId: number): Promise<Order | undefined>;
    /**
     * Get order by Shopify order ID
     */
    getByShopifyId(shopifyOrderId: string): Promise<Order | undefined>;
    /**
     * Update order status
     */
    updateStatus(orderId: number, status: string): Promise<void>;
    /**
     * Mark order as completed
     */
    markCompleted(orderId: number): Promise<void>;
}
//# sourceMappingURL=Order.d.ts.map