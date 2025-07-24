"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createShopifyRouter = createShopifyRouter;
// Shopify routes - vertical slice for Shopify integration endpoints
const express_1 = require("express");
function createShopifyRouter(shopifyService, orderService) {
    const router = (0, express_1.Router)();
    /**
     * POST /api/shopify/fetch-orders
     * Fetch orders from Shopify and save new ones to database
     */
    router.post('/fetch-orders', async (req, res) => {
        try {
            const { limit = 10 } = req.body;
            console.log('🚀 Starting Shopify order fetch and save...');
            // Fetch orders from Shopify
            const shopifyOrders = await shopifyService.fetchOrders(limit);
            if (shopifyOrders.length === 0) {
                const response = {
                    success: true,
                    message: 'No orders found in your Shopify store'
                };
                res.json(response);
                return;
            }
            // Process each order
            const results = {
                newOrders: 0,
                existingOrders: 0,
                errors: 0
            };
            for (const shopifyOrder of shopifyOrders) {
                try {
                    // Check if order already exists
                    const exists = await orderService.orderExists(shopifyOrder.id.toString());
                    if (exists) {
                        console.log(`⚠️ Order ${shopifyOrder.id} already exists in database - skipping`);
                        results.existingOrders++;
                        continue;
                    }
                    // Create new order
                    console.log(`\n🆕 Processing new order: ${shopifyOrder.id}`);
                    await orderService.createOrder(shopifyOrder);
                    results.newOrders++;
                }
                catch (orderError) {
                    console.error(`❌ Error processing order ${shopifyOrder.id}:`, orderError);
                    results.errors++;
                }
            }
            const response = {
                success: true,
                data: results,
                message: `Processed ${shopifyOrders.length} orders: ${results.newOrders} new, ${results.existingOrders} existing, ${results.errors} errors`
            };
            res.json(response);
        }
        catch (error) {
            console.error('❌ Error fetching orders from Shopify:', error);
            const response = {
                success: false,
                error: 'Failed to fetch orders from Shopify',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    /**
     * GET /api/shopify/test-connection
     * Test connection to Shopify API
     */
    router.get('/test-connection', async (req, res) => {
        try {
            const isConnected = await shopifyService.testConnection();
            const response = {
                success: isConnected,
                data: { connected: isConnected },
                message: isConnected ? 'Successfully connected to Shopify' : 'Failed to connect to Shopify'
            };
            res.status(isConnected ? 200 : 500).json(response);
        }
        catch (error) {
            console.error('❌ Error testing Shopify connection:', error);
            const response = {
                success: false,
                error: 'Failed to test Shopify connection',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    /**
     * GET /api/shopify/orders/:shopifyOrderId
     * Fetch a specific order from Shopify by ID
     */
    router.get('/orders/:shopifyOrderId', async (req, res) => {
        try {
            const { shopifyOrderId } = req.params;
            const order = await shopifyService.fetchOrderById(shopifyOrderId);
            if (!order) {
                const response = {
                    success: false,
                    error: 'Order not found',
                    message: `Order ${shopifyOrderId} not found in Shopify`
                };
                res.status(404).json(response);
                return;
            }
            const response = {
                success: true,
                data: order,
                message: `Found order ${shopifyOrderId}`
            };
            res.json(response);
        }
        catch (error) {
            console.error('❌ Error fetching order from Shopify:', error);
            const response = {
                success: false,
                error: 'Failed to fetch order from Shopify',
                message: error instanceof Error ? error.message : 'Unknown error'
            };
            res.status(500).json(response);
        }
    });
    return router;
}
//# sourceMappingURL=shopify.js.map