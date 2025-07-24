// Shopify routes - vertical slice for Shopify integration endpoints
import { Router, Request, Response } from 'express';
import { ShopifyService } from '@/services/ShopifyService';
import { OrderService } from '@/services/OrderService';
import { ApiResponse, ShopifyOrder } from '@/types';

export function createShopifyRouter(
  shopifyService: ShopifyService, 
  orderService: OrderService
): Router {
  const router = Router();

  /**
   * POST /api/shopify/fetch-orders
   * Fetch orders from Shopify and save new ones to database
   */
  router.post('/fetch-orders', async (req: Request, res: Response) => {
    try {
      const { limit = 10 } = req.body;

      console.log('🚀 Starting Shopify order fetch and save...');

      // Fetch orders from Shopify
      const shopifyOrders: ShopifyOrder[] = await shopifyService.fetchOrders(limit);

      if (shopifyOrders.length === 0) {
        const response: ApiResponse<never> = {
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

        } catch (orderError) {
          console.error(`❌ Error processing order ${shopifyOrder.id}:`, orderError);
          results.errors++;
        }
      }

      const response: ApiResponse<typeof results> = {
        success: true,
        data: results,
        message: `Processed ${shopifyOrders.length} orders: ${results.newOrders} new, ${results.existingOrders} existing, ${results.errors} errors`
      };

      res.json(response);

    } catch (error) {
      console.error('❌ Error fetching orders from Shopify:', error);
      
      const response: ApiResponse<never> = {
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
  router.get('/test-connection', async (req: Request, res: Response) => {
    try {
      const isConnected = await shopifyService.testConnection();
      
      const response: ApiResponse<{ connected: boolean }> = {
        success: isConnected,
        data: { connected: isConnected },
        message: isConnected ? 'Successfully connected to Shopify' : 'Failed to connect to Shopify'
      };

      res.status(isConnected ? 200 : 500).json(response);
    } catch (error) {
      console.error('❌ Error testing Shopify connection:', error);
      
      const response: ApiResponse<never> = {
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
  router.get('/orders/:shopifyOrderId', async (req: Request, res: Response) => {
    try {
      const { shopifyOrderId } = req.params;

      const order = await shopifyService.fetchOrderById(shopifyOrderId as string);
      
      if (!order) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Order not found',
          message: `Order ${shopifyOrderId} not found in Shopify`
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<ShopifyOrder> = {
        success: true,
        data: order,
        message: `Found order ${shopifyOrderId}`
      };

      res.json(response);
    } catch (error) {
      console.error('❌ Error fetching order from Shopify:', error);
      
      const response: ApiResponse<never> = {
        success: false,
        error: 'Failed to fetch order from Shopify',
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(response);
    }
  });

  return router;
}