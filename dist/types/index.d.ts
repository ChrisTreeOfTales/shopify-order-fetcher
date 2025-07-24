export interface Customer {
    customer_id: number;
    name: string;
    email: string | null;
    number_of_orders: number;
    created_at: string;
}
export interface Order {
    order_id: number;
    shopify_order_id: string;
    customer_id: number | null;
    ship_by_date: string | null;
    order_status: string | null;
    total_price: number;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
}
export interface Product {
    product_id: number;
    product_name: string;
    category: string | null;
    number_of_printing_plates: number;
    box_size: string | null;
    sku: string;
}
export interface OrderItem {
    order_item_id: number;
    order_id: number;
    product_id: number | null;
    customer_id: number | null;
    product_name: string | null;
    quantity: number;
    price: number;
    variant_title: string | null;
    variant_details: string | null;
    sku: string | null;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
}
export interface PrintingPlate {
    plate_id: number;
    order_item_id: number;
    plate_type: string;
    status: PrintingPlateStatus;
    created_at: string;
    updated_at: string;
    completed_at: string | null;
}
export interface Filament {
    filament_id: number;
    color_name: string;
    price: number | null;
    hex_code: string | null;
    supplier: string | null;
}
export type PrintingPlateStatus = 'In Queue' | 'In Progress' | 'Blocked' | 'Reprint' | 'Printed' | 'Done';
export type OrderStatus = 'paid' | 'pending' | 'refunded' | 'cancelled' | 'partially_paid';
export interface OrderSummaryDTO {
    order_id: number;
    shopify_order_id: string;
    customer_name: string | null;
    customer_email: string | null;
    total_price: number;
    order_status: string | null;
    created_at: string;
    total_items: number;
    total_quantity: number;
}
export interface OrderItemDetailDTO {
    order_item_id: number;
    order_id: number;
    customer_name: string | null;
    product_name: string | null;
    quantity: number;
    price: number;
    variant_title: string | null;
    variant_details: string | null;
    sku: string | null;
    total_plates: number;
    plates_in_queue: number;
    plates_in_progress: number;
    plates_printed: number;
    plates_done: number;
    plates_blocked: number;
    created_at: string;
}
export interface ShopifyCustomer {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string | null;
}
export interface ShopifyLineItem {
    id: number;
    title: string;
    quantity: number;
    price: string;
    variant_title: string | null;
    variant_option1: string | null;
    variant_option2: string | null;
    variant_option3: string | null;
    sku: string | null;
    properties: Array<{
        name: string;
        value: string;
    }> | null;
}
export interface ShopifyOrder {
    id: number;
    order_number: string;
    customer: ShopifyCustomer | null;
    total_price: string;
    financial_status: string;
    created_at: string;
    line_items: ShopifyLineItem[];
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface DatabaseConfig {
    filename: string;
}
export interface IDatabaseService {
    query<T = any>(sql: string, params?: any[]): Promise<T[]>;
    get<T = any>(sql: string, params?: any[]): Promise<T | undefined>;
    run(sql: string, params?: any[]): Promise<{
        id: number;
        changes: number;
    }>;
    close(): Promise<void>;
}
export interface IOrderService {
    getAllOrders(): Promise<OrderSummaryDTO[]>;
    getOrderItems(orderId: number): Promise<OrderItemDetailDTO[]>;
    createOrder(shopifyOrder: ShopifyOrder): Promise<number>;
    orderExists(shopifyOrderId: string): Promise<boolean>;
}
export interface ICustomerService {
    createOrUpdateCustomer(shopifyCustomer: ShopifyCustomer | null): Promise<number | null>;
    getCustomerById(customerId: number): Promise<Customer | undefined>;
}
export interface IProductService {
    getProductBySku(sku: string): Promise<Product | undefined>;
    getAllProducts(): Promise<Product[]>;
}
export interface IShopifyService {
    fetchOrders(limit?: number): Promise<ShopifyOrder[]>;
}
//# sourceMappingURL=index.d.ts.map