import { OrderItem, OrderItemDetailDTO, ShopifyLineItem, IDatabaseService } from '@/types';
export declare class OrderItemModel {
    private db;
    constructor(db: IDatabaseService);
    /**
     * Create order items for an order
     */
    create(lineItem: ShopifyLineItem, orderId: number, customerId: number | null, productId: number | null): Promise<number>;
    /**
     * Get order items with detailed information including printing plate status
     */
    getDetailsByOrderId(orderId: number): Promise<OrderItemDetailDTO[]>;
    /**
     * Get all order items
     */
    getAll(): Promise<OrderItem[]>;
    /**
     * Get order item by ID
     */
    getById(orderItemId: number): Promise<OrderItem | undefined>;
    /**
     * Update order item completion status
     */
    markCompleted(orderItemId: number): Promise<void>;
    /**
     * Get order items by product SKU
     */
    getBySku(sku: string): Promise<OrderItem[]>;
}
//# sourceMappingURL=OrderItem.d.ts.map