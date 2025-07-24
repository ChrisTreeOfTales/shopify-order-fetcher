// Orders routes - vertical slice for order-related endpoints
import { Router, Request, Response } from 'express';
import { OrderService } from '@/services/OrderService';
import { ApiResponse, OrderSummaryDTO, OrderItemDetailDTO } from '@/types';

export function createOrdersRouter(orderService: OrderService): Router {
  const router = Router();

  /**
   * GET /api/orders
   * Get all orders with summary information
   */
  router.get('/', async (req: Request, res: Response) => {
    try {
      const orders: OrderSummaryDTO[] = await orderService.getAllOrders();
      
      const response: ApiResponse<OrderSummaryDTO[]> = {
        success: true,
        data: orders,
        message: `Found ${orders.length} orders`
      };

      res.json(response);
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      
      const response: ApiResponse<never> = {
        success: false,
        error: 'Failed to fetch orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(response);
    }
  });

  /**
   * GET /api/orders/:orderId/items
   * Get order items for a specific order
   */
  router.get('/:orderId/items', async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId as string);

      if (isNaN(orderId)) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Invalid order ID',
          message: 'Order ID must be a number'
        };
        res.status(400).json(response);
        return;
      }

      const orderItems: OrderItemDetailDTO[] = await orderService.getOrderItems(orderId);
      
      const response: ApiResponse<OrderItemDetailDTO[]> = {
        success: true,
        data: orderItems,
        message: `Found ${orderItems.length} items for order ${orderId}`
      };

      res.json(response);
    } catch (error) {
      console.error('❌ Error fetching order items:', error);
      
      const response: ApiResponse<never> = {
        success: false,
        error: 'Failed to fetch order items',
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(response);
    }
  });

  /**
   * PUT /api/orders/:orderId/status
   * Update order status
   */
  router.put('/:orderId/status', async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId as string);
      const { status } = req.body;

      if (isNaN(orderId)) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Invalid order ID',
          message: 'Order ID must be a number'
        };
        res.status(400).json(response);
        return;
      }

      if (!status || typeof status !== 'string') {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Invalid status',
          message: 'Status must be a non-empty string'
        };
        res.status(400).json(response);
        return;
      }

      await orderService.updateOrderStatus(orderId, status as string);
      
      const response: ApiResponse<never> = {
        success: true,
        message: `Order ${orderId} status updated to: ${status as string}`
      };

      res.json(response);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      
      const response: ApiResponse<never> = {
        success: false,
        error: 'Failed to update order status',
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(response);
    }
  });

  /**
   * POST /api/orders/:orderId/complete
   * Mark order as completed
   */
  router.post('/:orderId/complete', async (req: Request, res: Response) => {
    try {
      const orderId = parseInt(req.params.orderId as string);

      if (isNaN(orderId)) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Invalid order ID',
          message: 'Order ID must be a number'
        };
        res.status(400).json(response);
        return;
      }

      await orderService.completeOrder(orderId);
      
      const response: ApiResponse<never> = {
        success: true,
        message: `Order ${orderId} marked as completed`
      };

      res.json(response);
    } catch (error) {
      console.error('❌ Error completing order:', error);
      
      const response: ApiResponse<never> = {
        success: false,
        error: 'Failed to complete order',
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(response);
    }
  });

  return router;
}