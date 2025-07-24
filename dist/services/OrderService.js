"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const Order_1 = require("@/models/Order");
const OrderItem_1 = require("@/models/OrderItem");
const Customer_1 = require("@/models/Customer");
const Product_1 = require("@/models/Product");
const PrintingPlate_1 = require("@/models/PrintingPlate");
class OrderService {
    constructor(db) {
        this.db = db;
        this.orderModel = new Order_1.OrderModel(db);
        this.orderItemModel = new OrderItem_1.OrderItemModel(db);
        this.customerModel = new Customer_1.CustomerModel(db);
        this.productModel = new Product_1.ProductModel(db);
        this.printingPlateModel = new PrintingPlate_1.PrintingPlateModel(db);
    }
    /**
     * Get all orders with summary information
     */
    async getAllOrders() {
        return this.orderModel.getAllSummaries();
    }
    /**
     * Get detailed order items for a specific order
     */
    async getOrderItems(orderId) {
        return this.orderItemModel.getDetailsByOrderId(orderId);
    }
    /**
     * Check if an order already exists in the database
     */
    async orderExists(shopifyOrderId) {
        return this.orderModel.exists(shopifyOrderId);
    }
    /**
     * Create a complete order from Shopify data
     */
    async createOrder(shopifyOrder) {
        console.log('✅ Processing new order!');
        console.log('📋 Order Details:');
        console.log(`   Shopify Order ID: ${shopifyOrder.id}`);
        console.log(`   Order Number: #${shopifyOrder.order_number}`);
        console.log(`   Customer: ${shopifyOrder.customer ?
            shopifyOrder.customer.first_name + ' ' + shopifyOrder.customer.last_name : 'Guest'}`);
        console.log(`   Total Price: ${shopifyOrder.total_price} SEK`);
        console.log(`   Status: ${shopifyOrder.financial_status}`);
        console.log(`   Created: ${new Date(shopifyOrder.created_at).toLocaleDateString()}`);
        console.log(`   Items: ${shopifyOrder.line_items.length} item(s)`);
        console.log('\n💾 Saving to database...');
        // 1. Create or update customer
        const customerId = await this.customerModel.createOrUpdate(shopifyOrder.customer);
        // 2. Create order
        const orderId = await this.orderModel.create(shopifyOrder, customerId);
        // 3. Create order items and printing plates
        await this.createOrderItems(shopifyOrder.line_items, orderId, customerId);
        console.log('\n✅ Order successfully saved to database!');
        return orderId;
    }
    /**
     * Create order items and their associated printing plates
     */
    async createOrderItems(lineItems, orderId, customerId) {
        for (const item of lineItems) {
            // Look up product information to get specific printing plate types
            let plateTypes = ['Plate', 'Plate']; // Default fallback
            let productId = null;
            if (item.sku) {
                try {
                    const product = await this.productModel.getPlateRequirementBySku(item.sku);
                    if (product) {
                        productId = product.product_id;
                        // Special handling for wound marker variations (TK030 SKU covers multiple products)
                        if (item.sku === 'TK030' && item.properties && item.properties.length > 0) {
                            // Extract variant details string similar to OrderItem model
                            const variantDetails = [];
                            item.properties.forEach(prop => {
                                if (!prop.name.startsWith('_mws')) {
                                    variantDetails.push(`${prop.name}: ${prop.value}`);
                                }
                            });
                            const variantDetailsString = variantDetails.join('|').toLowerCase();
                            // Parse dice size and type from variant details
                            let targetProductName = product.product_name; // Default fallback
                            if (variantDetailsString.includes('dice size: 12mm') && variantDetailsString.includes('type: xl pack')) {
                                targetProductName = '12mm Wound marker XL set';
                            }
                            else if (variantDetailsString.includes('dice size: 12mm') && variantDetailsString.includes('type: combo pack')) {
                                targetProductName = '12mm Wound marker combo';
                            }
                            else if (variantDetailsString.includes('dice size: 16mm') && variantDetailsString.includes('type: xl pack')) {
                                targetProductName = '16mm Wound marker XL set';
                            }
                            else if (variantDetailsString.includes('dice size: 16mm') && variantDetailsString.includes('type: combo pack')) {
                                targetProductName = '16mm Wound marker combo';
                            }
                            // If we determined a different product, try to find it
                            if (targetProductName !== product.product_name) {
                                const specificProduct = await this.db.query('SELECT product_id, product_name FROM products WHERE product_name = ?', [targetProductName]);
                                if (specificProduct.length > 0 && specificProduct[0]) {
                                    productId = specificProduct[0].product_id;
                                    console.log(`   🔍 Wound marker variant mapping: ${item.sku} + "${variantDetailsString}" -> ${targetProductName}`);
                                }
                            }
                        }
                        // Get the specific plate types for this product
                        const plateTypesData = await this.db.query('SELECT plate_name FROM product_plates WHERE product_id = ? ORDER BY plate_order ASC', [productId]);
                        if (plateTypesData.length > 0) {
                            plateTypes = plateTypesData.map(p => p.plate_name);
                            console.log(`   🔍 Found product: ${item.sku} requires ${plateTypes.length} plates: ${plateTypes.join(', ')}`);
                        }
                        else {
                            // Fallback to creating generic plates based on number_of_printing_plates
                            const numberOfPlates = product.number_of_printing_plates;
                            plateTypes = Array.from({ length: numberOfPlates }, (_, i) => `Plate ${i + 1}`);
                            console.log(`   🔍 Found product: ${item.sku} requires ${numberOfPlates} plates (generic)`);
                        }
                    }
                    else {
                        console.log(`   ⚠️ Product ${item.sku} not found in database, using default plates`);
                    }
                }
                catch (error) {
                    console.log(`   ⚠️ Error looking up product ${item.sku}: ${error}`);
                }
            }
            else {
                // No SKU - try to match by product name for Deployment Zone sets
                console.log(`   ⚠️ No SKU found for item: ${item.title}`);
                try {
                    if (item.title && item.title.toLowerCase().includes('deployment zone')) {
                        // Try to find product by partial name match
                        const deploymentProducts = await this.db.query('SELECT product_id, product_name, number_of_printing_plates FROM products WHERE product_name LIKE ?', ['%Deployment Zone%']);
                        if (deploymentProducts.length > 0) {
                            // Check if it's a double set - look for "double" in the title
                            const isDouble = item.title.toLowerCase().includes('double');
                            const targetProduct = deploymentProducts.find(p => isDouble ? p.product_name.toLowerCase().includes('double') : p.product_name.toLowerCase().includes('single')) || deploymentProducts[0]; // Fallback to first available
                            if (targetProduct) {
                                productId = targetProduct.product_id;
                                // Get the specific plate types for this product
                                const plateTypesData = await this.db.query('SELECT plate_name FROM product_plates WHERE product_id = ? ORDER BY plate_order ASC', [productId]);
                                if (plateTypesData.length > 0) {
                                    plateTypes = plateTypesData.map(p => p.plate_name);
                                    console.log(`   🔍 Matched Deployment Zone product: "${item.title}" -> ${targetProduct.product_name} requires ${plateTypes.length} plates: ${plateTypes.join(', ')}`);
                                }
                            }
                        }
                    }
                }
                catch (error) {
                    console.log(`   ⚠️ Error looking up product by name: ${error}`);
                }
            }
            // Create order item
            const orderItemId = await this.orderItemModel.create(item, orderId, customerId, productId);
            // Create printing plates with specific types
            await this.printingPlateModel.createForOrderItem(orderItemId, plateTypes);
        }
    }
    /**
     * Update order status
     */
    async updateOrderStatus(orderId, status) {
        await this.orderModel.updateStatus(orderId, status);
    }
    /**
     * Mark order as completed
     */
    async completeOrder(orderId) {
        await this.orderModel.markCompleted(orderId);
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=OrderService.js.map