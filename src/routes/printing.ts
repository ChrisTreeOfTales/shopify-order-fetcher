// Printing routes - vertical slice for printing plate management
import { Router, Request, Response } from 'express';
import { DatabaseService } from '@/services/DatabaseService';
import { PrintingPlateModel } from '@/models/PrintingPlate';
import { ApiResponse, PrintingPlateStatus } from '@/types';

export function createPrintingRouter(dbService: DatabaseService): Router {
  const router = Router();
  const printingPlateModel = new PrintingPlateModel(dbService);

  /**
   * GET /api/printing/plates
   * Get all printing plates with order information for the printing management view
   */
  router.get('/plates', async (req: Request, res: Response) => {
    try {
      const plates = await dbService.query(`
        SELECT 
          pp.plate_id,
          pp.order_item_id,
          pp.plate_type,
          pp.status,
          pp.created_at,
          pp.updated_at,
          COALESCE(p.product_name, oi.product_name) as product_name,
          oi.quantity,
          oi.variant_details,
          oi.sku,
          o.shopify_order_id,
          o.order_id,
          c.name as customer_name,
          c.email as customer_email
        FROM printing_plates pp
        LEFT JOIN order_items oi ON pp.order_item_id = oi.order_item_id
        LEFT JOIN orders o ON oi.order_id = o.order_id
        LEFT JOIN customers c ON oi.customer_id = c.customer_id
        LEFT JOIN products p ON oi.product_id = p.product_id
        WHERE pp.status IN ('In Queue', 'In Progress', 'Blocked')
        ORDER BY pp.created_at ASC
      `);

      const response: ApiResponse<typeof plates> = {
        success: true,
        data: plates,
        message: `Found ${plates.length} printing plates`
      };

      res.json(response);
    } catch (error) {
      console.error('❌ Error fetching printing plates:', error);
      
      const response: ApiResponse<never> = {
        success: false,
        error: 'Failed to fetch printing plates',
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(response);
    }
  });

  /**
   * PUT /api/printing/plates/:plateId/status
   * Update printing plate status
   */
  router.put('/plates/:plateId/status', async (req: Request, res: Response) => {
    try {
      const plateId = parseInt(req.params.plateId as string);
      const { status } = req.body;

      if (isNaN(plateId)) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Invalid plate ID',
          message: 'Plate ID must be a number'
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

      // Validate status value
      const validStatuses: PrintingPlateStatus[] = [
        'In Queue', 'In Progress', 'Blocked', 'Reprint', 'Printed', 'Done'
      ];

      if (!validStatuses.includes(status as PrintingPlateStatus)) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Invalid status value',
          message: `Status must be one of: ${validStatuses.join(', ')}`
        };
        res.status(400).json(response);
        return;
      }

      await printingPlateModel.updateStatus(plateId, status as PrintingPlateStatus);
      
      const response: ApiResponse<never> = {
        success: true,
        message: `Printing plate ${plateId} status updated to: ${status}`
      };

      res.json(response);
    } catch (error) {
      console.error('❌ Error updating printing plate status:', error);
      
      const response: ApiResponse<never> = {
        success: false,
        error: 'Failed to update printing plate status',
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(response);
    }
  });

  /**
   * GET /api/printing/plates/by-status/:status
   * Get printing plates filtered by status
   */
  router.get('/plates/by-status/:status', async (req: Request, res: Response) => {
    try {
      const status = req.params.status as PrintingPlateStatus;

      const plates = await dbService.query(`
        SELECT 
          pp.plate_id,
          pp.order_item_id,
          pp.plate_type,
          pp.status,
          pp.created_at,
          pp.updated_at,
          COALESCE(p.product_name, oi.product_name) as product_name,
          oi.quantity,
          oi.variant_details,
          oi.sku,
          o.shopify_order_id,
          o.order_id,
          c.name as customer_name,
          c.email as customer_email
        FROM printing_plates pp
        LEFT JOIN order_items oi ON pp.order_item_id = oi.order_item_id
        LEFT JOIN orders o ON oi.order_id = o.order_id
        LEFT JOIN customers c ON oi.customer_id = c.customer_id
        LEFT JOIN products p ON oi.product_id = p.product_id
        WHERE pp.status = ?
        ORDER BY pp.created_at ASC
      `, [status]);

      const response: ApiResponse<typeof plates> = {
        success: true,
        data: plates,
        message: `Found ${plates.length} printing plates with status: ${status}`
      };

      res.json(response);
    } catch (error) {
      console.error('❌ Error fetching printing plates by status:', error);
      
      const response: ApiResponse<never> = {
        success: false,
        error: 'Failed to fetch printing plates by status',
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(response);
    }
  });

  /**
   * GET /api/printing/stats
   * Get printing statistics summary
   */
  router.get('/stats', async (req: Request, res: Response) => {
    try {
      const stats = await dbService.get(`
        SELECT 
          COUNT(*) as total_plates,
          SUM(CASE WHEN status = 'In Queue' THEN 1 ELSE 0 END) as in_queue,
          SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
          SUM(CASE WHEN status = 'Blocked' THEN 1 ELSE 0 END) as blocked,
          SUM(CASE WHEN status = 'Reprint' THEN 1 ELSE 0 END) as reprint,
          0 as printed,
          0 as done
        FROM printing_plates
        WHERE status IN ('In Queue', 'In Progress', 'Blocked', 'Reprint')
      `);

      const response: ApiResponse<typeof stats> = {
        success: true,
        data: stats,
        message: 'Printing statistics retrieved successfully'
      };

      res.json(response);
    } catch (error) {
      console.error('❌ Error fetching printing statistics:', error);
      
      const response: ApiResponse<never> = {
        success: false,
        error: 'Failed to fetch printing statistics',
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(response);
    }
  });

  /**
   * GET /api/printing/completed-orders
   * Get order items where all printing plates have status "Printed"
   */
  router.get('/completed-orders', async (req: Request, res: Response) => {
    try {
      const completedOrders = await dbService.query(`
        SELECT 
          oi.order_item_id,
          oi.product_name,
          oi.quantity,
          oi.variant_details,
          oi.sku,
          oi.created_at,
          COALESCE(p.product_name, oi.product_name) as display_product_name,
          o.shopify_order_id,
          o.order_id,
          c.name as customer_name,
          c.email as customer_email,
          COUNT(pp.plate_id) as total_plates,
          SUM(CASE WHEN pp.status = 'Printed' THEN 1 ELSE 0 END) as printed_plates
        FROM order_items oi
        LEFT JOIN orders o ON oi.order_id = o.order_id
        LEFT JOIN customers c ON oi.customer_id = c.customer_id
        LEFT JOIN products p ON oi.product_id = p.product_id
        LEFT JOIN printing_plates pp ON oi.order_item_id = pp.order_item_id
        GROUP BY oi.order_item_id
        HAVING total_plates > 0 AND total_plates = printed_plates
        ORDER BY oi.created_at DESC
      `);

      const response: ApiResponse<typeof completedOrders> = {
        success: true,
        data: completedOrders,
        message: `Found ${completedOrders.length} completed order items`
      };

      res.json(response);
    } catch (error) {
      console.error('❌ Error fetching completed orders:', error);
      
      const response: ApiResponse<never> = {
        success: false,
        error: 'Failed to fetch completed orders',
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(response);
    }
  });

  /**
   * PUT /api/printing/order-items/:orderItemId/mark-done
   * Mark all plates for an order item as "Done"
   */
  router.put('/order-items/:orderItemId/mark-done', async (req: Request, res: Response) => {
    try {
      const orderItemId = parseInt(req.params.orderItemId as string);

      if (isNaN(orderItemId)) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Invalid order item ID',
          message: 'Order item ID must be a number'
        };
        res.status(400).json(response);
        return;
      }

      // Update all plates for this order item to "Done" status
      const result = await dbService.run(
        'UPDATE printing_plates SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_item_id = ?',
        ['Done', orderItemId]
      );

      if (result.changes === 0) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'No plates found',
          message: `No printing plates found for order item ${orderItemId}`
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<{ updatedPlates: number }> = {
        success: true,
        data: { updatedPlates: result.changes },
        message: `Marked ${result.changes} plates as "Done" for order item ${orderItemId}`
      };

      res.json(response);
    } catch (error) {
      console.error('❌ Error marking order item as done:', error);
      
      const response: ApiResponse<never> = {
        success: false,
        error: 'Failed to mark order item as done',
        message: error instanceof Error ? error.message : 'Unknown error'
      };

      res.status(500).json(response);
    }
  });

  return router;
}