import { IOrderService, OrderSummaryDTO, OrderItemDetailDTO, ShopifyOrder, IDatabaseService } from '@/types';
export declare class OrderService implements IOrderService {
    private db;
    private orderModel;
    private orderItemModel;
    private customerModel;
    private productModel;
    private printingPlateModel;
    constructor(db: IDatabaseService);
    /**
     * Get all orders with summary information
     */
    getAllOrders(): Promise<OrderSummaryDTO[]>;
    /**
     * Get detailed order items for a specific order
     */
    getOrderItems(orderId: number): Promise<OrderItemDetailDTO[]>;
    /**
     * Check if an order already exists in the database
     */
    orderExists(shopifyOrderId: string): Promise<boolean>;
    /**
     * Create a complete order from Shopify data
     */
    createOrder(shopifyOrder: ShopifyOrder): Promise<number>;
    /**
     * Create order items and their associated printing plates
     */
    private createOrderItems;
    /**
     * Update order status
     */
    updateOrderStatus(orderId: number, status: string): Promise<void>;
    /**
     * Mark order as completed
     */
    completeOrder(orderId: number): Promise<void>;
}
//# sourceMappingURL=OrderService.d.ts.map