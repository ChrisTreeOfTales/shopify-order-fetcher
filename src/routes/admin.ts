import { Router, Request, Response } from 'express';
import { DatabaseService } from '@/services/DatabaseService';
import { ApiResponse } from '@/types';

export function createAdminRouter(dbService: DatabaseService): Router {
  const router = Router();

  // Get all records from a table
  router.get('/tables/:tableName', async (req: Request, res: Response) => {
    try {
      const { tableName } = req.params;
      
      if (!tableName) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Missing table name',
          message: 'Table name is required'
        };
        res.status(400).json(response);
        return;
      }
      
      // Validate table name to prevent SQL injection
      const allowedTables = ['customers', 'orders', 'order_items', 'printing_plates', 'products', 'parts'];
      if (!allowedTables.includes(tableName)) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Invalid table name',
          message: `Table '${tableName}' is not accessible`
        };
        return res.status(400).json(response);
      }

      const query = `SELECT * FROM ${tableName} ORDER BY ROWID DESC LIMIT 1000`;
      const records = await dbService.query(query);

      const response: ApiResponse<any[]> = {
        success: true,
        data: records,
        message: `Retrieved ${records.length} records from ${tableName}`
      };

      res.json(response);
    } catch (error) {
      console.error('Error fetching table data:', error);
      const response: ApiResponse<never> = {
        success: false,
        error: 'Database error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      res.status(500).json(response);
    }
    return;
  });

  // Create new record
  router.post('/tables/:tableName', async (req: Request, res: Response) => {
    try {
      const { tableName } = req.params;
      const data = req.body;
      
      if (!tableName) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Missing table name',
          message: 'Table name is required'
        };
        res.status(400).json(response);
        return;
      }

      // Validate table name
      const allowedTables = ['customers', 'orders', 'order_items', 'printing_plates', 'products', 'parts'];
      if (!allowedTables.includes(tableName)) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Invalid table name',
          message: `Table '${tableName}' is not accessible`
        };
        return res.status(400).json(response);
      }

      // Filter out empty or ID fields
      const filteredData: any = {};
      for (const [key, value] of Object.entries(data)) {
        if (value !== '' && value !== null && value !== undefined) {
          // Skip auto-generated ID fields
          if (!(key.includes('id') || key.includes('_id')) || value) {
            filteredData[key] = value;
          }
        }
      }

      if (Object.keys(filteredData).length === 0) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'No data provided',
          message: 'No valid data fields provided for insertion'
        };
        return res.status(400).json(response);
      }

      // Build INSERT query
      const columns = Object.keys(filteredData);
      const placeholders = columns.map(() => '?').join(', ');
      const values = Object.values(filteredData);

      const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
      const result = await dbService.run(query, values);

      const response: ApiResponse<{ id: number }> = {
        success: true,
        data: { id: result.id },
        message: `Record created successfully`
      };

      res.json(response);
    } catch (error) {
      console.error('Error creating record:', error);
      const response: ApiResponse<never> = {
        success: false,
        error: 'Database error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      res.status(500).json(response);
    }
    return;
  });

  // Update record
  router.put('/tables/:tableName/:id', async (req: Request, res: Response) => {
    try {
      const { tableName, id } = req.params;
      const data = req.body;
      
      if (!tableName || !id) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Missing parameters',
          message: 'Table name and ID are required'
        };
        res.status(400).json(response);
        return;
      }

      // Validate table name
      const allowedTables = ['customers', 'orders', 'order_items', 'printing_plates', 'products', 'parts'];
      if (!allowedTables.includes(tableName)) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Invalid table name',
          message: `Table '${tableName}' is not accessible`
        };
        return res.status(400).json(response);
      }

      // Filter out empty values and build update data
      const updateData: any = {};
      for (const [key, value] of Object.entries(data)) {
        // Skip ID fields from updates
        if (!(key.includes('id') || key.includes('_id'))) {
          updateData[key] = value;
        }
      }

      if (Object.keys(updateData).length === 0) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'No data provided',
          message: 'No valid data fields provided for update'
        };
        return res.status(400).json(response);
      }

      // Build UPDATE query
      const setPairs = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updateData), id];

      // Determine the correct ID column name
      let idColumn = 'id';
      if (tableName === 'customers') idColumn = 'customer_id';
      else if (tableName === 'orders') idColumn = 'order_id';
      else if (tableName === 'printing_plates') idColumn = 'plate_id';
      else if (tableName === 'products') idColumn = 'product_id';
      else if (tableName === 'order_items') idColumn = 'item_id';
      else if (tableName === 'parts') idColumn = 'part_id';

      const query = `UPDATE ${tableName} SET ${setPairs} WHERE ${idColumn} = ?`;
      const result = await dbService.run(query, values);

      if (result.changes === 0) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Record not found',
          message: `No record found with ID ${id}`
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<{ changes: number }> = {
        success: true,
        data: { changes: result.changes },
        message: `Record updated successfully`
      };

      res.json(response);
    } catch (error) {
      console.error('Error updating record:', error);
      const response: ApiResponse<never> = {
        success: false,
        error: 'Database error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      res.status(500).json(response);
    }
    return;
  });

  // Delete record
  router.delete('/tables/:tableName/:id', async (req: Request, res: Response) => {
    try {
      const { tableName, id } = req.params;
      
      if (!tableName || !id) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Missing parameters',
          message: 'Table name and ID are required'
        };
        res.status(400).json(response);
        return;
      }

      // Validate table name
      const allowedTables = ['customers', 'orders', 'order_items', 'printing_plates', 'products', 'parts'];
      if (!allowedTables.includes(tableName)) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Invalid table name',
          message: `Table '${tableName}' is not accessible`
        };
        return res.status(400).json(response);
      }

      // Determine the correct ID column name
      let idColumn = 'id';
      if (tableName === 'customers') idColumn = 'customer_id';
      else if (tableName === 'orders') idColumn = 'order_id';
      else if (tableName === 'printing_plates') idColumn = 'plate_id';
      else if (tableName === 'products') idColumn = 'product_id';
      else if (tableName === 'order_items') idColumn = 'item_id';
      else if (tableName === 'parts') idColumn = 'part_id';

      const query = `DELETE FROM ${tableName} WHERE ${idColumn} = ?`;
      const result = await dbService.run(query, [id]);

      if (result.changes === 0) {
        const response: ApiResponse<never> = {
          success: false,
          error: 'Record not found',
          message: `No record found with ID ${id}`
        };
        return res.status(404).json(response);
      }

      const response: ApiResponse<{ changes: number }> = {
        success: true,
        data: { changes: result.changes },
        message: `Record deleted successfully`
      };

      res.json(response);
    } catch (error) {
      console.error('Error deleting record:', error);
      const response: ApiResponse<never> = {
        success: false,
        error: 'Database error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
      res.status(500).json(response);
    }
    return;
  });

  return router;
}